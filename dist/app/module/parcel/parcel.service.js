"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const parcel_interface_1 = require("./parcel.interface");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const parcel_model_1 = require("./parcel.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const parcel_constant_1 = require("./parcel.constant");
const createParcel = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelInfo = payload;
    if (decodedToken.role === user_interface_1.Role.RECEIVER) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Receiver cannot create parcel");
    }
    const isReceiverExist = yield user_model_1.User.findById(payload.receiver);
    if (!isReceiverExist) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver not found");
    }
    const parcelInfoWithSender = Object.assign(Object.assign({}, parcelInfo), { sender: decodedToken.userId });
    const parcel = yield parcel_model_1.Parcel.create(parcelInfoWithSender);
    parcel.statusLogs.push({
        status: parcel_interface_1.ParcelStatus.REQUESTED,
        updatedBy: decodedToken.userId,
        note: `Status is Requested`,
        updatedAt: new Date()
    });
    yield parcel.save();
    return parcel;
});
const getAllParcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const allParcels = yield parcel_model_1.Parcel.find({});
    const totalParcel = yield parcel_model_1.Parcel.countDocuments();
    return {
        data: allParcels,
        meta: {
            total: totalParcel
        }
    };
});
const getParcelById = (parcelId, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (decodedToken.role === user_interface_1.Role.RECEIVER) {
        if (decodedToken.userId.toString() !== (parcel === null || parcel === void 0 ? void 0 : parcel.receiver.toString())) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Unauthorized access");
        }
    }
    if (decodedToken.role === user_interface_1.Role.RECEIVER) {
        if (decodedToken.userId.toString() !== (parcel === null || parcel === void 0 ? void 0 : parcel.receiver.toString())) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Unauthorized access");
        }
    }
    if (decodedToken.role === user_interface_1.Role.SENDER) {
        if (decodedToken.userId.toString() !== (parcel === null || parcel === void 0 ? void 0 : parcel.sender.toString())) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Unauthorized access");
        }
    }
    return parcel;
});
const getMyParcels = (decodedToken, query) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield user_model_1.User.findById(decodedToken.userId);
    if (!me) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    let baseQuery;
    if (me.role === user_interface_1.Role.RECEIVER) {
        baseQuery = parcel_model_1.Parcel.find({ receiver: me._id }).populate("sender receiver", "name email");
    }
    else if (me.role === user_interface_1.Role.SENDER) {
        baseQuery = parcel_model_1.Parcel.find({ sender: me._id }).populate("sender receiver", "name email");
    }
    else if (me.role === user_interface_1.Role.ADMIN || me.role === user_interface_1.Role.SUPER_ADMIN) {
        baseQuery = parcel_model_1.Parcel.find({}).populate("sender receiver", "name email");
    }
    else {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized role");
    }
    // Use QueryBuilder
    const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query, parcel_constant_1.parcelSearchableFields);
    const parcelsQuery = queryBuilder
        .search()
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        parcelsQuery.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const cancelParcel = (parcelId, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield user_model_1.User.findById(decodedToken.userId);
    if (!me) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    if (me.role === user_interface_1.Role.SENDER && !parcel.sender.equals(me._id)) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "You can cancel only your own parcels");
    }
    // Check if parcel can be canceled (not dispatched)
    if ([parcel_interface_1.ParcelStatus.DISPATCHED, parcel_interface_1.ParcelStatus.IN_TRANSIT, parcel_interface_1.ParcelStatus.DELIVERED].includes(parcel.currentStatus)) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel cannot be canceled at this stage");
    }
    // Update status
    parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
    parcel.statusLogs.push({
        status: parcel_interface_1.ParcelStatus.CANCELLED,
        updatedBy: me._id,
        note: "Parcel canceled",
        updatedAt: new Date()
    });
    yield parcel.save();
});
const updateParcel = (parcelId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    if (parcel.receiver.toString() !== decodedToken.userId && parcel.sender.toString() !== decodedToken.userId && decodedToken.role !== user_interface_1.Role.ADMIN && decodedToken.role !== user_interface_1.Role.SUPER_ADMIN) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized access.");
    }
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
        throw new appError_1.default(http_status_codes_1.default.CONFLICT, "Parcel already cancelled.");
    }
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.DELIVERED) {
        throw new appError_1.default(http_status_codes_1.default.CONFLICT, "Parcel already delivered, cannot update.");
    }
    if (decodedToken.role === user_interface_1.Role.RECEIVER) {
        if ([
            parcel_interface_1.ParcelStatus.APPROVED,
            parcel_interface_1.ParcelStatus.DISPATCHED,
            parcel_interface_1.ParcelStatus.IN_TRANSIT,
            parcel_interface_1.ParcelStatus.BLOCKED,
            parcel_interface_1.ParcelStatus.REQUESTED,
            parcel_interface_1.ParcelStatus.CANCELLED,
        ].includes(payload.status)) {
            throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized access");
        }
    }
    if (decodedToken.role === user_interface_1.Role.SENDER) {
        if ([
            parcel_interface_1.ParcelStatus.APPROVED,
            parcel_interface_1.ParcelStatus.DISPATCHED,
            parcel_interface_1.ParcelStatus.IN_TRANSIT,
            parcel_interface_1.ParcelStatus.BLOCKED,
            parcel_interface_1.ParcelStatus.DELIVERED,
        ].includes(payload.status)) {
            throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Unauthorized access");
        }
    }
    if (payload.status && payload.status === parcel.currentStatus) {
        throw new appError_1.default(http_status_codes_1.default.CONFLICT, `Parcel is already in status: ${payload.status}`);
    }
    if (payload.status) {
        parcel.currentStatus = payload.status;
        parcel.statusLogs.push({
            status: payload.status,
            updatedBy: user._id,
            note: payload.note || `Status updated to ${payload.status}`,
            updatedAt: new Date(),
        });
    }
    const updatableFields = ["senderAddress", "receiverAddress", "weight", "fee"];
    updatableFields.forEach((field) => {
        if (payload[field]) {
            parcel[field] = payload[field];
        }
    });
    yield parcel.save();
    const updatedParcel = yield parcel.populate("sender receiver", "name email");
    return updatedParcel;
});
const getParcelStatusLog = (parcelId, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!parcel) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (parcel.sender.toString() !== decodedToken.userId &&
        parcel.receiver.toString() !== decodedToken.userId &&
        decodedToken.role !== user_interface_1.Role.ADMIN &&
        decodedToken.role !== user_interface_1.Role.SUPER_ADMIN) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to view this parcel's status logs");
    }
    return parcel.statusLogs;
});
exports.ParcelServices = {
    createParcel,
    getAllParcel,
    getParcelById,
    getMyParcels,
    cancelParcel,
    updateParcel,
    getParcelStatusLog
};
