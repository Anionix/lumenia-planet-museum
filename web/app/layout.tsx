import type { Metadata } from 'next';
import './globals.css';

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: server component; transition: document metadata -> static HTML
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'Lumenia Planet Museum',
  description: 'ひとつの球から、いくつもの表現へ。色と、かたちと、その背後にある仕事を巡る。',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
