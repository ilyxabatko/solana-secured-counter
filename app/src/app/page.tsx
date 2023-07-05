"use client"

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as anchor from "@project-serum/anchor";
import idl from "@/idl/solana_counter.json";
import { SolanaCounter } from "@/types/solana_counter";
import useIsMounted from '@/utils/Mount';
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function Home() {
    const wallet = useAnchorWallet();
    const connection = useConnection();
    const isMounted = useIsMounted();

    const [program, setProgram] = useState<anchor.Program<SolanaCounter>>(null!);
    const [account, setAccount] = useState<{ publicKey: anchor.web3.PublicKey, data: anchor.BN }>(null!);
    const [value, setValue] = useState<number>(0);

    const programID = new anchor.web3.PublicKey(idl.metadata.address);

    // The function retireves all the "SolanaCounter" program accounts where the authority
    // matches the provided authority, later on we'll check if such an account exist
    const getAllAccountsByAuthority = async (
        accounts: anchor.AccountClient<SolanaCounter>,
        authority: anchor.web3.PublicKey
    ) => {
        return await accounts.all([
            {
                memcmp: {
                    // We use offset 8 because the first 8 bytes are for a descriminator
                    // then we have "authority" field in the "Counter" account
                    offset: 8,
                    bytes: authority.toBase58(),
                },
            },
        ]);
    };

    const getCounterPDA = async () => {

    }

    // Returns error on the first render in console, but then sets up a connection, provider,
    // program and account data (in case the latter exists)
    useEffect(() => {
        if (!wallet || !connection) return console.error("Wallet or Connection is not initialized");

        // creates connection from the wallet connection
        const anchorConnection = new anchor.web3.Connection(
            connection.connection.rpcEndpoint,
            connection.connection.commitment
        );

        // creates provider 
        const provider = new anchor.AnchorProvider(
            anchorConnection,
            wallet,
            { preflightCommitment: connection.connection.commitment }
        );

        const program = new anchor.Program<SolanaCounter>(
            JSON.parse(JSON.stringify(idl)),
            programID,
            provider
        );
        setProgram(program);

        getAllAccountsByAuthority(
            // we pass the "Counter" account type
            program.account.counter,
            wallet.publicKey
        ).then((result) => {
            if (result.length > 0) {
                setAccount({
                    publicKey: result[0]!.publicKey,
                    data: result[0]?.account.count,
                });
            }
        });
    }, [wallet, connection]);

    // Calls the "initialize_counter" instruction in case the program is set and a wallet is connected
    const initCounter = async () => {
        console.log("Initializing a Counter PDA...");

        if (!program || !wallet) {
            console.error("Program or wallet is not initialized");
            return;
        }

        const seeds = [Buffer.from("counter"), wallet.publicKey.toBuffer()];
        const counterPDA = await anchor.web3.PublicKey.findProgramAddressSync(seeds, programID);

        try {
            await program.methods.initializeCounter()
                .accounts({
                    counterAcc: counterPDA[0],
                    signer: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .rpc();

            const counterAccount = await program.account.counter.fetch(counterPDA[0]);
            setAccount({
                publicKey: counterPDA[0],
                data: counterAccount.count
            });
        } catch (error) {
            console.error(`Error initializing the Counter account: ${error}`);
        }
    };

    // Increments the "count" value of a Counter account, then updates the "account" state hook
    const increment = async () => {
        console.log("Incrementing the Counter account's count value...");

        try {
            await program.methods.increment()
                .accounts({
                    counterAcc: account.publicKey,
                    authority: wallet!.publicKey,
                })
                .rpc();

            const counterAccount = await program.account.counter.fetch(account.publicKey);
            setAccount({
                publicKey: account.publicKey,
                data: counterAccount.count
            });
        } catch (error) {
            console.error(`Error incrementing the Counter account's count value: ${error}`);
        }
    };

    // Decrements the "count" value of a Counter account, then updates the "account" state hook
    const decrement = async () => {
        console.log("Decrementing the Counter account's count value...");

        try {
            await program.methods.decrement()
                .accounts({
                    counterAcc: account.publicKey,
                    authority: wallet!.publicKey,
                })
                .rpc();

            const counterAccount = await program.account.counter.fetch(account.publicKey);
            setAccount({
                publicKey: account.publicKey,
                data: counterAccount.count
            });
        } catch (error) {
            console.error(`Error decrementing the Counter account's count value: ${error}`);
        }
    };

    // Sets a particular value to the "count" field of a Counter account, then updates the "account" state hook
    const setCount = async () => {
        console.log(`Setting the ${value} the Counter account's count field...`);

        try {
            await program.methods.setCounter(new anchor.BN(value))
                .accounts({
                    counterAcc: account.publicKey,
                    authority: wallet!.publicKey,
                })
                .rpc();

            const counterAccount = await program.account.counter.fetch(account.publicKey);
            setAccount({
                publicKey: account.publicKey,
                data: counterAccount.count
            });
        } catch (error) {
            console.error(`Error setting the ${value} to Counter account's count field: ${error}`);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center relative">

            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col justify-center items-center bg-orange-100 rounded-lg shadow p-4 m-2">
                    {isMounted && <WalletMultiButton className="bg-orange-400 hover:text-white rounded-lg text-black" />}

                    <div className="flex flex-col justify-center items-center bg-orange-200 rounded-lg shadow p-4 mt-3">
                        <h1 className="text-center p-4 text-3xl font-semibold">Solana Counter (Devnet)</h1>

                        {wallet && connection ? (
                            <>
                                {account ? (
                                    <div className="flex items-center justify-center sm:flex-col">
                                        <button className="rounded-full font-bold px-2.5 py-2 m-2 mr-5 bg-orange-400 hover:bg-black hover:text-white text-4xl sm:m-2 sm:absolute sm:bottom-6 sm:left-5 sm:text-9xl sm:bg-orange-200" onClick={increment}>➕</button>

                                        <div className="flex flex-col items-center justify-center border-x-2 border-orange-100 px-4 sm:border-none ">
                                            <input type="number" min={0} value={value} onChange={(event) => setValue(Number(event.target.value))} placeholder="Counter value" className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-auto bg-transparent outline-none py-1 px-2 border-b-2 border-gray-700 focus:border-blue-500" />
                                            <button className="rounded-lg font-bold px-4 py-3 m-2 w-full bg-orange-400 hover:bg-black hover:text-white" onClick={setCount}>Set Counter</button>
                                            <p>
                                                Current Counter: {account.data.toString()}
                                            </p>
                                        </div>

                                        <button disabled={account.data.toNumber() === 0} className="rounded-full font-bold px-2.5 py-2 m-2 ml-5 bg-orange-400 hover:bg-black hover:text-white text-4xl sm:m-2 sm:absolute sm:bottom-6 sm:right-5 sm:text-9xl sm:bg-orange-200 disabled:bg-slate-500" onClick={decrement}>➖</button>
                                    </div>
                                ) : (
                                    <button className="rounded-lg font-bold px-4 py-3 m-2 bg-orange-400 hover:bg-black hover:text-white" onClick={initCounter}>Initialize Counter</button>
                                )}
                            </>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            </div>

        </main>
    )
}
