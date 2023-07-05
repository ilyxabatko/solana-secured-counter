import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Wallet } from '@/context/Wallet';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Solana Secured Counter dApp'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <Wallet>
                <body className={`${inter.className} bg-orange-400 text-black container mx-auto`}>
                    {children}
                </body>
            </Wallet>
        </html>
    )
}
