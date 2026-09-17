import ts from 'typescript';
import path from 'node:path';

// llm machine contract; claim UUIDv5: 25be1b45-323c-5527-b69d-fc6367ed331d
// execution UUIDv7 is supplied by run-application-check.mjs.
// state: source; transition: parsed module graph -> explicit capability violations; unknown syntax rejects
export function inspectSources(sources) {
  const issues = { plumeriaScope: [], plumeriaComposition: [], staticExport: [], componentBoundary: [] };
  const modules = new Map();
  for (const [filename, text] of sources) {
    const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true,
      filename.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const module = { filename, source, imports: [], dependencies: [], client: false, capabilities: [] };
    modules.set(filename, module);
    const add = (category, node, message) => issues[category].push({ file: filename,
      line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, message });
    const plumeriaImports = source.statements.filter(node => ts.isImportDeclaration(node) && node.moduleSpecifier.text === '@plumeria/core');
    const styleNamespaces = new Set();
    for (const declaration of plumeriaImports) {
      const binding = declaration.importClause?.namedBindings;
      if (binding && ts.isNamespaceImport(binding)) styleNamespaces.add(binding.name.text);
      else if (declaration.importClause) add('plumeriaScope', declaration, 'Only a namespace or side-effect Plumeria import is supported by this contract');
    }
    const browserNames = new Set(['window', 'document', 'navigator', 'localStorage', 'sessionStorage',
      'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'devicePixelRatio', 'CSS', 'globalThis', 'self']);
    const reactHooks = new Set();
    for (const declaration of source.statements) {
      if (ts.isExpressionStatement(declaration) && ts.isStringLiteral(declaration.expression)) {
        if (declaration.expression.text === 'use client') module.client = true;
        if (declaration.expression.text === 'use server') add('staticExport', declaration, 'Server Actions need a server runtime');
      }
      if (ts.isImportDeclaration(declaration) && !declaration.importClause?.isTypeOnly) {
        const specifier = declaration.moduleSpecifier.text;
        if (declaration.importClause?.namedBindings && ts.isNamedImports(declaration.importClause.namedBindings) &&
          declaration.importClause.namedBindings.elements.every(binding => binding.isTypeOnly)) continue;
        module.imports.push(specifier);
        if (specifier === 'react' && declaration.importClause?.namedBindings && ts.isNamedImports(declaration.importClause.namedBindings)) {
          for (const binding of declaration.importClause.namedBindings.elements) {
            if (/^use(State|Effect|LayoutEffect|Reducer|Ref|SyncExternalStore|ActionState|Transition|DeferredValue|ImperativeHandle)$/.test((binding.propertyName ?? binding.name).text)) reactHooks.add(binding.name.text);
          }
        }
        if (['next/headers', 'next/server', 'server-only'].includes(specifier)) add('staticExport', declaration, 'Request-time server capability is prohibited in this static application');
        if (specifier === 'next/image') add('staticExport', declaration, 'This application contract requires explicit static images, without the server image optimizer');
      }
      if (ts.isExportDeclaration(declaration) && declaration.moduleSpecifier && ts.isStringLiteral(declaration.moduleSpecifier))
        module.imports.push(declaration.moduleSpecifier.text);
    }
    if (/(?:^|\/)(?:middleware|proxy|route)\.[cm]?[jt]sx?$/.test(filename)) add('staticExport', source, 'Request handlers are outside this static application contract');
    function visit(node, typePosition = false) {
      typePosition ||= ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
      if (!typePosition) {
        if (ts.isIdentifier(node) && styleNamespaces.has(node.text) &&
          !(ts.isNamespaceImport(node.parent) && node.parent.name === node) &&
          !(ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node))
          add('plumeriaScope', node, 'Plumeria namespace aliases, mutation and shadowing are not permitted');
        if (ts.isJsxSpreadAttribute(node)) add('componentBoundary', node, 'Opaque JSX prop spreads require an explicit capability contract');
        if (ts.isIdentifier(node) && browserNames.has(node.text) &&
          // Literal object keys name data; shorthand values and computed keys still access a binding.
          !(ts.isPropertyAssignment(node.parent) && node.parent.name === node) &&
          !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)) module.capabilities.push('browser API: ' + node.text);
        if (ts.isCallExpression(node)) {
          if (reactHooks.has(node.expression.getText(source)) || /^React\.use[A-Z]/.test(node.expression.getText(source))) module.capabilities.push('React state or effect');
          if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) module.imports.push(node.arguments[0].text);
            else add('componentBoundary', node, 'Nonliteral dynamic import cannot be checked');
          }
          if (ts.isIdentifier(node.expression) && ['require', 'eval', 'Function'].includes(node.expression.text))
            add('componentBoundary', node, 'Opaque executable dependency is outside this application contract');
        }
        if (ts.isPropertyAccessExpression(node) && styleNamespaces.has(node.expression.getText(source))) {
          const call = node.parent, declaration = call.parent;
          if (!(ts.isCallExpression(call) && call.expression === node && ['create', 'keyframes'].includes(node.name.text) &&
            ts.isVariableDeclaration(declaration) && declaration.initializer === call &&
            ts.isVariableDeclarationList(declaration.parent) && (declaration.parent.flags & ts.NodeFlags.Const) !== 0 &&
            ts.isVariableStatement(declaration.parent.parent) && ts.isSourceFile(declaration.parent.parent.parent))) add('plumeriaScope', node, 'css.create and css.keyframes must initialize module-level const declarations; aliases and other APIs need an explicit contract extension');
        }
        if (ts.isJsxAttribute(node)) {
          const name = node.name.getText(source);
          if (/^on[A-Z]/.test(name)) module.capabilities.push('event handler: ' + name);
          if (name === 'className') add('plumeriaComposition', node, 'Use classStyle in application JSX');
          if (name === 'classStyle' && (!plumeriaImports.length || !node.initializer ||
            !ts.isJsxExpression(node.initializer) || !node.initializer.expression ||
            !ts.isArrayLiteralExpression(node.initializer.expression) || node.initializer.expression.elements.length === 0))
            add('plumeriaComposition', node, 'classStyle requires a nonempty array and a Plumeria import');
        }
        if (ts.isVariableDeclaration(node) && ['dynamic', 'revalidate', 'dynamicParams'].includes(node.name.getText(source))) {
          const value = node.initializer?.getText(source);
          if ((node.name.getText(source) === 'dynamic' && value?.includes('force-dynamic')) ||
              (node.name.getText(source) === 'revalidate' && value !== 'false') ||
              (node.name.getText(source) === 'dynamicParams' && value !== 'false')) add('staticExport', node, 'Server-runtime route configuration is prohibited');
        }
      }
      ts.forEachChild(node, child => visit(child, typePosition));
    }
    visit(source);
    if (source.parseDiagnostics.length) for (const diagnostic of source.parseDiagnostics) add('componentBoundary', source, ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '));
  }
  for (const module of modules.values()) for (const specifier of module.imports) {
    if (specifier.startsWith('.')) {
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(module.filename), specifier));
      const resolved = [base, base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx'].find(name => modules.has(name));
      if (resolved) module.dependencies.push(resolved);
      else if (!specifier.endsWith('.css')) issues.componentBoundary.push({ file: module.filename, line: 1, message: 'Unresolved local dependency: ' + specifier });
    } else if (specifier === 'three' || specifier.startsWith('three/')) module.capabilities.push('three-dimensional rendering');
    // llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
    // execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: next/link -> allowed static navigation; unknown imports -> rejected
    else if (!['react', 'react-dom', '@plumeria/core', 'next/link', 'next/navigation', 'next', 'next/headers', 'next/server', 'server-only'].includes(specifier))
      issues.componentBoundary.push({ file: module.filename, line: 1, message: 'Unclassified external dependency: ' + specifier });
  }
  const serverReached = new Set(), clientReached = new Set();
  const visitGraph = (filename, client) => {
    const module = modules.get(filename); if (!module) return;
    client ||= module.client;
    const reached = client ? clientReached : serverReached;
    if (reached.has(filename)) return; reached.add(filename);
    module.dependencies.forEach(name => visitGraph(name, client));
  };
  for (const filename of modules.keys()) if (/(?:^|\/)(page|layout|not-found)\.tsx$/.test(filename)) visitGraph(filename, false);
  for (const filename of serverReached) {
    const module = modules.get(filename);
    for (const capability of new Set(module.capabilities)) issues.componentBoundary.push({ file: filename, line: 1, message: capability + ' is reachable outside a client boundary' });
  }
  for (const filename of clientReached) {
    const module = modules.get(filename);
    if (module.imports.some(name => ['server-only', 'next/headers', 'next/server'].includes(name)))
      issues.componentBoundary.push({ file: filename, line: 1, message: 'A server-only dependency is reachable from the client graph' });
  }
  return { issues, graph: [...modules.values()].map(({ filename, dependencies, client, capabilities }) => ({ filename, dependencies, client, capabilities: [...new Set(capabilities)] })),
    serverReached: [...serverReached], clientReached: [...clientReached] };
}
