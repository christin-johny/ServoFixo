import { Transaction } from "../../domain/entities/Transaction";
import { Wallet } from "../../domain/entities/Wallet";
import { TransactionResponseDto, WalletResponseDto } from "../dto/wallet/WalletDto";

export class WalletMapper {
  static toResponse(entity: Wallet): WalletResponseDto {
    const props = entity.toProps();
    return {
      id: props.id!,
      technicianId: props.technicianId,
      balances: props.balances,
      lastPayoutAt: props.metadata?.lastPayoutAt
    };
  }

  static toTransactionResponse(entity: Transaction): TransactionResponseDto {
    const props = entity.toProps();
    return {
      id: props.id!,
      walletId: props.walletId,
      bookingId: props.bookingId,
      amount: props.amount,
      type: props.type,
      category: props.category,
      status: props.status,
      description: props.description,
      createdAt: props.createdAt!
    };
  }
    
}