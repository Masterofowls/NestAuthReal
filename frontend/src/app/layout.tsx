import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope, Syne } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NestAuth',
  description: 'Secure authentication with passkeys, OAuth, and device flow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${manrope.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  );
}
