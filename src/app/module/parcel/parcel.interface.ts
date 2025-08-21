import { Types } from "mongoose";

export enum ParcelStatus {
    REQUESTED = "REQUESTED",
    APPROVED = "APPROVED",
    DISPATCHED = "DISPATCHED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    BLOCKED = "BLOCKED"
} 

export enum ParcelType {
    DOCUMENT = "DOCUMENT",
    ELECTRONICS = "ELECTRONICS",
    CLOTHING = "CLOTHING",
    FOOD = "FOOD",
    FRAGILE = "FRAGILE",
    HEAVY_ITEM = "HEAVY_ITEM",
    OTHER = "OTHER"
}


export interface IStatusLog {
    status: ParcelStatus;                // Current status
    location?: string;                    // Location when status updated
    note?: string;                        // Extra notes
    updatedBy: Types.ObjectId;            // Admin or system user who updated
    updatedAt: Date;                      // Timestamp of the update
}

export interface IParcel {
    trackingId: string;                   // Unique tracking ID (TRK-YYYYMMDD-XXXXXX)
    type: ParcelType;                          // Type of parcel (Document, Electronics, etc.)
    weight: number;                        // Weight in kg
    fee: number;                           // Delivery fee
    sender: Types.ObjectId;                // Sender user ID
    receiver: Types.ObjectId;              // Receiver user ID
    senderAddress: string;                 // Full sender address
    receiverAddress: string;               // Full receiver address
    currentStatus: ParcelStatus;           // Current status of the parcel
    statusLogs: IStatusLog[];               // History of all status changes
    isBlocked: boolean;                    // Admin can block the parcel
    createdAt?: Date;
    updatedAt?: Date;
}

