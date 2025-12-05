import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import './globals.css';

export const metadata: Metadata = {
  title: 'Mio - Your Luxurious Educational Assistant',
  description: 'AI-powered conversations to master any topic with elegance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
