export interface Zone {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  boundaries: { lat: number; lng: number }[];
  isActive: boolean;
}

export interface CreateZoneDTO {
  name: string;
  description: string;
  boundaries: { lat: number; lng: number }[];
}
 
export interface UpdateZoneDTO {
  id: string;
  name: string;
  description: string;
  boundaries: { lat: number; lng: number }[];
  isActive: boolean;
}