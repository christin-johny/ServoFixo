import { ClientSession } from "mongoose";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Wallet } from "../../../domain/entities/Wallet";
import { Transaction } from "../../../domain/entities/Transaction";
import { WalletModel, WalletDocument } from "../mongoose/models/WalletModel";
import { TransactionModel  } from "../mongoose/models/TransactionModel";
import { IDatabaseSession } from "../../../application/interfaces/services/IDatabaseSession";

export class WalletMongoRepository implements IWalletRepository {
  
  private _getNativeSession(session?: IDatabaseSession): ClientSession | undefined {
    return session ? session.getNativeSession() : undefined;
  }

  async findByTechnicianId(technicianId: string, session?: IDatabaseSession): Promise<Wallet | null> {
    const nativeSession = this._getNativeSession(session);
    const doc = await WalletModel.findOne({ technicianId }).session(nativeSession || null).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(wallet: Wallet): Promise<Wallet> {
    const persistenceData = this.toPersistence(wallet);
    const doc = await WalletModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(wallet: Wallet, session?: IDatabaseSession): Promise<Wallet> {
    const nativeSession = this._getNativeSession(session);
    const props = wallet.toProps();
    
    const doc = await WalletModel.findByIdAndUpdate(
      props.id,
      { balances: props.balances, metadata: props.metadata },
      { new: true, session: nativeSession }
    ).exec();

    return this.toDomain(doc!);
  }

  async createTransaction(transaction: Transaction, session?: IDatabaseSession): Promise<Transaction> {
    const nativeSession = this._getNativeSession(session);
    const props = transaction.toProps();
    
    const [doc] = await TransactionModel.create([props], { session: nativeSession });
    return new Transaction({ ...props, id: doc._id.toString() });
  }

  // --- Mappers ---

  private toDomain(doc: WalletDocument): Wallet {
    return new Wallet({
      id: doc._id.toString(),
      technicianId: doc.technicianId,
      balances: doc.balances,
      metadata: doc.metadata,
      timestamps: {
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }
    });
  }

  private toPersistence(wallet: Wallet) {
    const props = wallet.toProps();
    return {
      technicianId: props.technicianId,
      balances: props.balances,
      metadata: props.metadata
    };
  }

  // Implementing remaining IBaseRepository methods
  async findById(id: string): Promise<Wallet | null> {
    const doc = await WalletModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await WalletModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // Extra methods defined in IWalletRepository interface
  async findTransactionsByWalletId(walletId: string, limit: number, skip: number) {
      const total = await TransactionModel.countDocuments({ walletId });
      const docs = await TransactionModel.find({ walletId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      return {
          data: docs.map(d => new Transaction({
              id: d._id.toString(),
              walletId: d.walletId,
              bookingId: d.bookingId,
              amount: d.amount,
              type: d.type ,
              category: d.category  ,
              status: d.status  ,
              createdAt: d.createdAt
          })),
          total
      };
  }

  async findEligibleForPayout(minAmount: number): Promise<Wallet[]> {
      const docs = await WalletModel.find({ "balances.withdrawable": { $gte: minAmount } }).exec();
      return docs.map(d => this.toDomain(d));
  }
}