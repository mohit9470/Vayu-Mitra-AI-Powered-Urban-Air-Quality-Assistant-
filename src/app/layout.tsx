import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VayuMitra | AI-Powered Urban Air Quality Assistant',
  description: 'Intelligent, grounded lifestyle and indoor air quality interventions powered by real-time Indian air monitoring APIs and Generative AI reasoning.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
