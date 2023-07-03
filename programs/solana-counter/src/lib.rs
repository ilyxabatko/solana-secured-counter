use anchor_lang::prelude::*;
use std::ops::DerefMut;

declare_id!("CEw2ET86pVmsXEg4rAUWR8QdHX2Meh7WuYtnoKmdpLSB");

#[program]
pub mod solana_counter {
    use super::*;

    pub fn initialize_counter(ctx: Context<Initialize>) -> Result<()> {
        msg!("Initializing the counter account...");
        
        let counter_account = ctx.accounts.counter_acc.deref_mut();
        let bump = *ctx.bumps.get("counter_acc").ok_or(ErrorCode::CannotGetBump)?;

        *counter_account = Counter {
            authority: *ctx.accounts.signer.key,
            count: 0,
            bump,
        };

        msg!("Initialized new \"Counter\" account. Current value: {}", counter_account.count);

        Ok(())
    }

    pub fn increment(ctx: Context<SetData>) -> Result<()> {
        msg!("Incrementing the counter...");

        let counter_acc = &mut ctx.accounts.counter_acc;
        counter_acc.count += 1;

        msg!("Current \"counter \"value: {}", counter_acc.count);

        Ok(())
    }

    pub fn decrement(ctx: Context<SetData>) -> Result<()> {
        msg!("Decrementing the counter...");

        let counter_acc = &mut ctx.accounts.counter_acc;
        counter_acc.count -= 1;

        msg!("Current \"counter \"value: {}", counter_acc.count);

        Ok(())
    }

    pub fn set_counter(ctx: Context<SetData>, num: u64) -> Result<()> {
        msg!("Setting the counter to {}...", num);

        let counter_acc = &mut ctx.accounts.counter_acc;
        counter_acc.count = num;

        msg!("Current \"counter \"value: {}", counter_acc.count);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Inits a PDA
    #[account(
        init,
        payer = signer, 
        seeds = [b"counter".as_ref(), signer.key.as_ref()],
        bump,
        space = Counter::SIZE,
    )]
    pub counter_acc: Account<'info, Counter>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> { 
    // varifiaction structure to check if PDA is valid
    #[account(
        mut, 
        seeds = [b"counter", authority.key().as_ref()], 
        bump = counter_acc.bump,
        owner = id(),
        constraint = counter_acc.authority == authority.key()
    )]
    pub counter_acc: Account<'info, Counter>,
    pub authority: Signer<'info>,
}


#[account]
pub struct Counter {
    authority: Pubkey,
    count: u64,
    bump: u8
}

impl Counter {
    const SIZE: usize = 8 + 32 + 8 + 1; // 8 - descriminator, 32 - pubkey, 8 - u64, 1 - u8 (bytes);
}

#[error_code]
pub enum ErrorCode {
    #[msg("Cannot get the bump of the Counter PDA")]
    CannotGetBump
}