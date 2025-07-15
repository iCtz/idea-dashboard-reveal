import "@/index.css"; // Assuming your global styles are here
import { Providers } from "@/components/providers";
// import './globals.css'
import { Inter } from 'next/font/google'
import { metadata } from "./metadata";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <title>{metadata.title as string}</title>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
