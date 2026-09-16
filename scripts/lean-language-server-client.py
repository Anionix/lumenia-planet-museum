"""Call the pinned Lean server through the official MCP standard-input client.

Sources: https://github.com/modelcontextprotocol/python-sdk/tree/v1.x
         https://github.com/oOo0oOo/lean-lsp-mcp
Trust: local executable and dependency installation; no server signature is claimed.
"""
import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    batch = json.load(sys.stdin)
    # machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55
    # transition: request -> actual server response -> immediately flushed evidence.
    server = StdioServerParameters(
        command=sys.executable,
        args=["-m", "lean_lsp_mcp", "--lean-project-path", batch["sourceRoot"]],
        env={**os.environ, "LEAN_LOG_LEVEL": "NONE", "LEAN_BUILD_CONCURRENCY": "share"},
    )
    async with stdio_client(server) as (reader, writer):
        async with ClientSession(reader, writer) as session:
            await session.initialize()
            outlines = {}
            for request in batch["requests"]:
                if request.get("resolveEndOf"):
                    name = request.pop("resolveEndOf").rsplit(".", 1)[-1]
                    matches = [item for item in outlines[request["arguments"]["file_path"]]
                               if item["name"].rsplit(".", 1)[-1] == name]
                    request["arguments"]["line"] = max(item["end_line"] for item in matches)
                started = datetime.now(timezone.utc).isoformat()
                result = await session.call_tool(request["tool"], request["arguments"])
                if request["tool"] == "lean_file_outline":
                    outlines[request["arguments"]["file_path"]] = result.structuredContent["declarations"]
                print(json.dumps({**request, "startedAt": started,
                    "completedAt": datetime.now(timezone.utc).isoformat(),
                    "response": result.model_dump(mode="json", exclude_none=True)}), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
