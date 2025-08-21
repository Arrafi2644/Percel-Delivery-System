"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParcelZodSchema = exports.CreateParcelZodSchema = exports.StatusLogZodSchema = void 0;
const zod_1 = require("zod");
const parcel_interface_1 = require("./parcel.interface");
exports.StatusLogZodSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(parcel_interface_1.ParcelStatus), // must match enum
    location: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
    updatedBy: zod_1.z.string().min(1, { message: "updatedBy (User ID) is required" }),
    updatedAt: zod_1.z.date().optional().default(() => new Date())
});
exports.CreateParcelZodSchema = zod_1.z.object({
    trackingId: zod_1.z.string().min(1, { message: "Tracking ID is required" }).optional(),
    type: zod_1.z.nativeEnum(parcel_interface_1.ParcelType),
    weight: zod_1.z.number().positive({ message: "Weight must be a positive number" }),
    fee: zod_1.z.number().nonnegative({ message: "Fee must be 0 or greater" }).optional(),
    sender: zod_1.z.string().min(1, { message: "Sender (User ID) is required" }).optional(), // ObjectId string
    receiver: zod_1.z.string().min(1, { message: "Receiver (User ID) is required" }),
    senderAddress: zod_1.z.string().min(1, { message: "Sender address is required" }),
    receiverAddress: zod_1.z.string().min(1, { message: "Receiver address is required" }),
    currentStatus: zod_1.z.nativeEnum(parcel_interface_1.ParcelStatus).default(parcel_interface_1.ParcelStatus.REQUESTED),
    statusLogs: zod_1.z.array(exports.StatusLogZodSchema).default([]),
    isBlocked: zod_1.z.boolean().default(false)
});
exports.UpdateParcelZodSchema = zod_1.z.object({
    trackingId: zod_1.z.string().min(1).optional(),
    type: zod_1.z.nativeEnum(parcel_interface_1.ParcelType).optional(),
    weight: zod_1.z.number().positive().optional(),
    fee: zod_1.z.number().nonnegative().optional(),
    sender: zod_1.z.string().min(1).optional(),
    receiver: zod_1.z.string().min(1).optional(),
    senderAddress: zod_1.z.string().min(1).optional(),
    receiverAddress: zod_1.z.string().min(1).optional(),
    currentStatus: zod_1.z.nativeEnum(parcel_interface_1.ParcelStatus).optional(),
    statusLogs: zod_1.z.array(exports.StatusLogZodSchema).optional(),
    isBlocked: zod_1.z.boolean().optional()
});
