"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
const StatusLogSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        required: true
    },
    location: { type: String },
    note: { type: String },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });
const ParcelSchema = new mongoose_1.Schema({
    trackingId: { type: String, unique: true },
    type: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelType),
        required: true
    },
    weight: { type: Number },
    fee: { type: Number },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    senderAddress: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    currentStatus: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.REQUESTED
    },
    statusLogs: { type: [StatusLogSchema], default: [] },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });
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
exports.Parcel = (0, mongoose_1.model)("Parcel", ParcelSchema);
