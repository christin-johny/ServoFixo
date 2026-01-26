export interface ReviewProps {
  id?: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  rating: number; 
  comment?: string;
  createdAt?: Date;
}

export class Review {
  constructor(private readonly _props: ReviewProps) {
    if (!_props.createdAt) _props.createdAt = new Date();
  }

  // Getters
  public getId(): string | undefined { return this._props.id; }
  public getBookingId(): string { return this._props.bookingId; }
  public getTechnicianId(): string { return this._props.technicianId; }
  public getRating(): number { return this._props.rating; }
  
  public toProps(): ReviewProps { return this._props; }
}