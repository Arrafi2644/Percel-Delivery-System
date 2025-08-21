import { z } from "zod";
import { ParcelStatus, ParcelType } from "./parcel.interface";

export const StatusLogZodSchema = z.object({
  status: z.nativeEnum(ParcelStatus), // must match enum
  location: z.string().optional(),
  note: z.string().optional(),
  updatedBy: z.string().min(1, { message: "updatedBy (User ID) is required" }),
  updatedAt: z.date().optional().default(() => new Date())
});

export const CreateParcelZodSchema = z.object({
  trackingId: z.string().min(1, { message: "Tracking ID is required" }).optional(),
  type: z.nativeEnum(ParcelType),
  weight: z.number().positive({ message: "Weight must be a positive number" }),
  fee: z.number().nonnegative({ message: "Fee must be 0 or greater" }).optional(),
  sender: z.string().min(1, { message: "Sender (User ID) is required" }).optional(),   // ObjectId string
  receiver: z.string().min(1, { message: "Receiver (User ID) is required" }),
  senderAddress: z.string().min(1, { message: "Sender address is required" }),
  receiverAddress: z.string().min(1, { message: "Receiver address is required" }),
  currentStatus: z.nativeEnum(ParcelStatus).default(ParcelStatus.REQUESTED),
  statusLogs: z.array(StatusLogZodSchema).default([]),
  isBlocked: z.boolean().default(false)
});

export const UpdateParcelZodSchema = z.object({
  trackingId: z.string().min(1).optional(),
  type: z.nativeEnum(ParcelType).optional(),
  weight: z.number().positive().optional(),
  fee: z.number().nonnegative().optional(),
  sender: z.string().min(1).optional(),
  receiver: z.string().min(1).optional(),
  senderAddress: z.string().min(1).optional(),
  receiverAddress: z.string().min(1).optional(),
  currentStatus: z.nativeEnum(ParcelStatus).optional(),
  statusLogs: z.array(StatusLogZodSchema).optional(),
  isBlocked: z.boolean().optional()
});
