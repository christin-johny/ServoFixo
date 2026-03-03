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

  public calculateAndAddEarnings(totalBookingAmount: number): number {
    const technicianShare = totalBookingAmount * 0.90;
    
    this._balances.withdrawable += technicianShare;
    
    return technicianShare;
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
}