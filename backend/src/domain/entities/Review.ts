export interface ReviewProps {
  id?: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  serviceId: string;  
  rating: number; 
  comment?: string;
  createdAt?: Date;
  customerSnapshot?: {
      name: string;
      avatarUrl?: string;
  };
  isDeleted: boolean;
}

export class Review {
  constructor(private readonly _props: ReviewProps) {
    if (!_props.createdAt) _props.createdAt = new Date();
  }

  // Getters
  public getId(): string | undefined { return this._props.id; }
  public getBookingId(): string { return this._props.bookingId; }
  public getTechnicianId(): string { return this._props.technicianId; }
  public getServiceId(): string { return this._props.serviceId; } 
  public getRating(): number { return this._props.rating; }
  public getComment(): string | undefined { return this._props.comment; }
  public getCreatedAt(): Date { return this._props.createdAt!; }
  public getCustomerSnapshot() {return this._props.customerSnapshot;}
  public getIsDeleted() {return this._props.isDeleted;}
  public toProps(): ReviewProps { return this._props; }

}