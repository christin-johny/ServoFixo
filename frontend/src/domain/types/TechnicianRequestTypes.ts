export interface ServiceRequest {
    id: string;
    serviceId: string;
    categoryId: string;
    action: "ADD" | "REMOVE";
    proofUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date | string;  
    resolvedAt?: Date | string;  
    isDismissed: boolean;
    isArchived: boolean;
}

export interface ZoneRequest {
    id: string;
    currentZoneId: string;
    requestedZoneId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date | string;  
    resolvedAt?: Date | string;
    isDismissed: boolean;
    isArchived: boolean;
}

export interface BankUpdateRequest {
    id: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
    proofUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date | string;  
    resolvedAt?: Date | string; 
    isDismissed: boolean;
    isArchived: boolean;
}