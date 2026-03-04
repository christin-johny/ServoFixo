export type PayoutStatus = "PENDING" | "APPROVED" | "FAILED" | "FLAGGED";

export interface PayoutProps {
  id?: string;
  technicianId: string;
  walletId: string;
  amount: number;
  status: PayoutStatus;
  weekEnding: Date;
  bankSnapshot: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  adminId?: string;
  processedAt?: Date;
  failureReason?: string;
}

export class Payout {
  constructor(private readonly _props: PayoutProps) {}

  public toProps(): PayoutProps {
    return { ...this._props };
  }

  public getId(): string | undefined {
    return this._props.id;
  }

  public approve(adminId: string): void {
    this._props.status = "APPROVED";
    this._props.adminId = adminId;
  }

  public markAsFlagged(adminId: string): void {
    this._props.status = "FLAGGED";
    this._props.adminId = adminId;
  }
}