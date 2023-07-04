"use client"

import { Program, Provider, web3 } from '@project-serum/anchor';
import InitPDAButton from '@/components/InitPDA';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {

    return (
        <main className="flex min-h-screen items-center justify-center">

            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col justify-center items-center bg-orange-100 rounded-lg shadow p-4">
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    <div className="bg-orange-200 rounded-lg shadow p-4 mt-1">
                        <InitPDAButton />
                    </div>
                </div>
            </div>

        </main>
    )
}
