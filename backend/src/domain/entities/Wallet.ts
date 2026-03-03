import { WalletBalances, WalletMetadata } from "../value-objects/WalletTypes";

export interface WalletProps {
  id?: string;
  technicianId: string;
  balances: WalletBalances;
  metadata?: WalletMetadata;
  timestamps?: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export class Wallet {
  private _id?: string;
  private _technicianId: string;
  private _balances: WalletBalances;
  private _metadata: WalletMetadata;
  private _timestamps?: { createdAt: Date; updatedAt: Date };

  constructor(props: WalletProps) {
    this._id = props.id;
    this._technicianId = props.technicianId;
    this._balances = props.balances;
    this._metadata = props.metadata || {};
    this._timestamps = props.timestamps;
  }

  /**
   * Stage A: Job Completion (90% Credit)
   */
  public calculateAndAddEarnings(totalBookingAmount: number): number {
    const technicianShare = totalBookingAmount * 0.90;
    
    // Add to withdrawable as per your PDF logic
    this._balances.withdrawable += technicianShare;
    
    // Track lifetime earnings
    this._balances.totalEarned = (this._balances.totalEarned || 0) + technicianShare;
    
    return technicianShare;
  }

  /**
   * Stage C: Payout Finalization (Debit)
   * This is called by ApprovePayoutUseCase when the bank transfer is confirmed.
   */
  public finalizePayout(amount: number): void {
    if (this._balances.withdrawable < amount) {
      throw new Error("INSUFFICIENT_FUNDS_FOR_PAYOUT");
    }
    
    // Deduct the amount being sent to the bank
    this._balances.withdrawable -= amount;
  }

  public toProps(): WalletProps {
    return {
      id: this._id,
      technicianId: this._technicianId,
      balances: { ...this._balances },
      metadata: { ...this._metadata },
      timestamps: this._timestamps
    };
  }
 
  public get id(): string | undefined { return this._id; }
  public get technicianId(): string { return this._technicianId; }
  public get balances(): WalletBalances { return this._balances; }
}