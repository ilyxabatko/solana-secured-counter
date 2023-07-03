import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { assert } from "chai";

describe("solana-counter", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

    const [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("counter"),
            provider.wallet.publicKey.toBuffer()
        ],
        program.programId
    );

    it("is initialized", async () => {
        await program.methods.initializeCounter()
            .accounts({
                counterAcc: counterPDA,
                signer: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.ok(counterAccount.count.eq(new anchor.BN(0)));
    });

    it("sets the counter a particular value", async () => {
        const value: anchor.BN = new anchor.BN(1220);

        await program.methods.setCounter(value)
            .accounts({
                counterAcc: counterPDA,
                authority: provider.wallet.publicKey
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.ok(counterAccount.count.eq(new anchor.BN(1220)));
    });

    it("increments the counter", async () => {
        await program.methods.increment()
            .accounts({
                counterAcc: counterPDA,
                authority: provider.wallet.publicKey,
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.ok(counterAccount.count.eq(new anchor.BN(1221)));
    });

    it("decrements the counter", async () => {
        await program.methods.decrement()
            .accounts({
                counterAcc: counterPDA,
                authority: provider.wallet.publicKey,
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPDA);
        assert.ok(counterAccount.count.eq(new anchor.BN(1220)));

    });
});
