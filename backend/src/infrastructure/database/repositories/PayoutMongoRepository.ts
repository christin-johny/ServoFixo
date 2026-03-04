import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { Payout, PayoutStatus } from "../../../domain/entities/Payout";
import { PayoutModel } from "../mongoose/models/PayoutModel";

export class PayoutMongoRepository implements IPayoutRepository {
  
  async createBatch(payouts: Payout[]): Promise<void> {
    const docs = payouts.map(p => {
      const props = p.toProps();
      return {
        technicianId: props.technicianId,
        walletId: props.walletId,
        amount: props.amount,
        status: props.status,
        weekEnding: props.weekEnding,
        bankSnapshot: props.bankSnapshot
      };
    });
    await PayoutModel.insertMany(docs);
  }

  async findById(id: string): Promise<Payout | null> {
    const doc = await PayoutModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(payout: Payout): Promise<void> {
    const props = payout.toProps();
    await PayoutModel.findByIdAndUpdate(props.id, {
      status: props.status,
      adminId: props.adminId,
      processedAt: props.processedAt,
      failureReason: props.failureReason
    }).exec();
  }

  async findPending(): Promise<Payout[]> {
    const docs = await PayoutModel.find({ status: "PENDING" }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findAllGroupedByWeek(): Promise<Payout[] | null> {
    return await PayoutModel.aggregate([
      {
        $group: {
          _id: "$weekEnding",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          payouts: { $push: "$$ROOT" }
        }
      },
      { $sort: { "_id": -1 } }
    ]);
  } 
  async findFiltered(filters: { page: number; limit: number; status?: string; technicianIds?: string[] }): Promise<{ data: Payout[]; total: number }> {
    const query: any = {};
     
    if (filters.status) {
      query.status = filters.status;
    }
     
    if (filters.technicianIds && filters.technicianIds.length > 0) {
      query.technicianId = { $in: filters.technicianIds };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [docs, total] = await Promise.all([
      PayoutModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit).exec(),
      PayoutModel.countDocuments(query)
    ]);

    return {
      data: docs.map(doc => this.toDomain(doc)),
      total
    };
  }

  private toDomain(doc:any): Payout {
    return new Payout({
      id: doc._id.toString(),
      technicianId: doc.technicianId,
      walletId: doc.walletId,
      amount: doc.amount,
      status: doc.status as PayoutStatus,
      weekEnding: doc.weekEnding,
      bankSnapshot: doc.bankSnapshot,
      adminId: doc.adminId,
      processedAt: doc.processedAt,
      failureReason: doc.failureReason
    });
  }
}