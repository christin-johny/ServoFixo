export interface ServiceRequest {
    id: string;
    serviceId: string;
    categoryId: string;
    action: "ADD" | "REMOVE";
    proofUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date | string; // ✅ Rectified
    resolvedAt?: Date | string; // ✅ Rectified
}

export interface ZoneRequest {
    id: string;
    currentZoneId: string;
    requestedZoneId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminComments?: string;
    requestedAt: Date | string; // ✅ Rectified
    resolvedAt?: Date | string; // ✅ Rectified
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
    requestedAt: Date | string; // ✅ Rectified
    resolvedAt?: Date | string; // ✅ Rectified
}