import { Schema, model } from "mongoose";
import { IParcel, IStatusLog, ParcelStatus, ParcelType } from "./parcel.interface";

const StatusLogSchema = new Schema<IStatusLog>(
    {
        status: {
            type: String,
            enum: Object.values(ParcelStatus),
            required: true
        },
        location: { type: String },
        note: { type: String },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        updatedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const ParcelSchema = new Schema<IParcel>(
    {
        trackingId: { type: String, unique: true },
        type: {
            type: String,
            enum: Object.values(ParcelType),
            required: true
        },
        weight: { type: Number},
        fee: { type: Number },
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderAddress: { type: String, required: true },
        receiverAddress: { type: String, required: true },
        currentStatus: {
            type: String,
            enum: Object.values(ParcelStatus),
            default: ParcelStatus.REQUESTED
        },
        statusLogs: { type: [StatusLogSchema], default: [] },
        isBlocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Auto-generate tracking ID and fee
ParcelSchema.pre("save", function (next) {
  if (!this.trackingId) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    this.trackingId = `TRK-${datePart}-${randomPart}`;
  }

  if (!this.fee && this.weight) {
    this.fee = 70 + this.weight * 10;
  }

  next();
});

export const Parcel = model<IParcel>("Parcel", ParcelSchema);
