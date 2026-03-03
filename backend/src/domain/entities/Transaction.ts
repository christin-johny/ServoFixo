import { TransactionType, TransactionCategory, TransactionStatus } from "../value-objects/WalletTypes";

export interface TransactionProps {
  id?: string;
  walletId: string;
  bookingId?: string; // Linked booking for job earnings
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  description?: string;
  createdAt?: Date;
}

export class Transaction {
  private _props: TransactionProps;

  constructor(props: TransactionProps) {
    this._props = {
      ...props,
      createdAt: props.createdAt || new Date()
    };
  }

  public toProps(): TransactionProps {
    return { ...this._props };
  }

  public get id(): string | undefined { return this._props.id; }
}