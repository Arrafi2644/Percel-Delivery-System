import { JwtPayload } from 'jsonwebtoken';
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import { IParcel, ParcelStatus } from "./parcel.interface"
import AppError from "../../errorHelpers/appError";
import { Parcel } from "./parcel.model";
import { Role } from "../user/user.interface";
import { User } from '../user/user.model';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { parcelSearchableFields } from './parcel.constant';


const createParcel = async (payload: Partial<IParcel>, decodedToken: JwtPayload) => {
  const parcelInfo = payload;

  if (decodedToken.role === Role.RECEIVER) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Receiver cannot create parcel")
  }

  const isReceiverExist = await User.findById(payload.receiver)
  if (!isReceiverExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found")
  }

  const parcelInfoWithSender = {
         ...parcelInfo,
         sender: decodedToken.userId
  }

  const parcel = await Parcel.create(parcelInfoWithSender)

    parcel.statusLogs.push({
      status: ParcelStatus.REQUESTED,
      updatedBy: decodedToken.userId,
      note: `Status is Requested`,
      updatedAt: new Date()
    });

  await parcel.save();
  return parcel;
}

const getAllParcel = async () => {
  const allParcels = await Parcel.find({})
  const totalParcel = await Parcel.countDocuments();

  return {
    data: allParcels,
    meta: {
      total: totalParcel
    }
  };
}

const getParcelById = async (parcelId: string, decodedToken: JwtPayload) => {

  const parcel = await Parcel.findById(parcelId)

  if (decodedToken.role === Role.RECEIVER) {
    if (decodedToken.userId.toString() !== parcel?.receiver.toString()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Unauthorized access");
    }
  }

  if (decodedToken.role === Role.RECEIVER) {
    if (decodedToken.userId.toString() !== parcel?.receiver.toString()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Unauthorized access");
    }
  }

  if (decodedToken.role === Role.SENDER) {
    if (decodedToken.userId.toString() !== parcel?.sender.toString()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Unauthorized access");
    }
  }

  return parcel;
}


const getMyParcels = async (decodedToken: JwtPayload, query: Record<string, string>) => {
  const me = await User.findById(decodedToken.userId);

  if (!me) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  let baseQuery;

  if (me.role === Role.RECEIVER) {
    baseQuery = Parcel.find({ receiver: me._id }).populate(
      "sender receiver",
      "name email"
    );
  } else if (me.role === Role.SENDER) {
    baseQuery = Parcel.find({ sender: me._id }).populate(
      "sender receiver",
      "name email"
    );
  } else if (me.role === Role.ADMIN || me.role === Role.SUPER_ADMIN) {
    baseQuery = Parcel.find({}).populate("sender receiver", "name email");
  } else {
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized role");
  }

  // Use QueryBuilder
  const queryBuilder = new QueryBuilder<IParcel>(baseQuery, query, parcelSearchableFields);

  const parcelsQuery = queryBuilder
    .search()
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    parcelsQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const cancelParcel = async (parcelId: string, decodedToken: JwtPayload) => {

  const me = await User.findById(decodedToken.userId);

  if (!me) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (me.role === Role.SENDER && !parcel.sender.equals(me._id)) {
    throw new AppError(httpStatus.FORBIDDEN, "You can cancel only your own parcels");
  }

  // Check if parcel can be canceled (not dispatched)
  if ([ParcelStatus.DISPATCHED, ParcelStatus.IN_TRANSIT, ParcelStatus.DELIVERED].includes(parcel.currentStatus)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel cannot be canceled at this stage");
  }

  // Update status
  parcel.currentStatus = ParcelStatus.CANCELLED;
  parcel.statusLogs.push({
    status: ParcelStatus.CANCELLED,
    updatedBy: me._id,
    note: "Parcel canceled",
    updatedAt: new Date()
  });

  await parcel.save();

}

const updateParcel = async (parcelId: string, payload: any, decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcel = await Parcel.findById(parcelId);
  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if(parcel.receiver.toString() !== decodedToken.userId && parcel.sender.toString() !== decodedToken.userId &&  decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN){
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized access.")
  }

  if (parcel.currentStatus === ParcelStatus.CANCELLED) {
    throw new AppError(httpStatus.CONFLICT, "Parcel already cancelled.");
  }

  if (parcel.currentStatus === ParcelStatus.DELIVERED) {
    throw new AppError(httpStatus.CONFLICT, "Parcel already delivered, cannot update.");
  }

  if (decodedToken.role === Role.RECEIVER) {
    if (
      [
        ParcelStatus.APPROVED,
        ParcelStatus.DISPATCHED,
        ParcelStatus.IN_TRANSIT,
        ParcelStatus.BLOCKED,
        ParcelStatus.REQUESTED,
        ParcelStatus.CANCELLED,
      ].includes(payload.status)
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "Unauthorized access");
    }
  }

  if (decodedToken.role === Role.SENDER) {
    if (
      [
        ParcelStatus.APPROVED,
        ParcelStatus.DISPATCHED,
        ParcelStatus.IN_TRANSIT,
        ParcelStatus.BLOCKED,
        ParcelStatus.DELIVERED,
      ].includes(payload.status)
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "Unauthorized access");
    }
  }

  if (payload.status && payload.status === parcel.currentStatus) {
    throw new AppError(httpStatus.CONFLICT, `Parcel is already in status: ${payload.status}`);
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
      (parcel as any)[field] = payload[field];
    }
  });

  await parcel.save();
  const updatedParcel = await parcel.populate("sender receiver", "name email");
  return updatedParcel;
};

const getParcelStatusLog = async (parcelId: string, decodedToken: JwtPayload) => {
  const parcel = await Parcel.findById(parcelId);
  const user = await User.findById(decodedToken.userId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    parcel.sender.toString() !== decodedToken.userId &&
    parcel.receiver.toString() !== decodedToken.userId &&
    decodedToken.role !== Role.ADMIN &&
    decodedToken.role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this parcel's status logs");
  }

  return parcel.statusLogs
}


export const ParcelServices = {
  createParcel,
  getAllParcel,
  getParcelById,
  getMyParcels,
  cancelParcel,
  updateParcel,
  getParcelStatusLog
}