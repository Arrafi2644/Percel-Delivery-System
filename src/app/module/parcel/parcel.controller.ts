/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelServices } from './parcel.service';

const createParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user;

    const parcel = await ParcelServices.createParcel(req.body, decodedToken)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Parcel Created Successfully",
        data: parcel
    })

})

const getAllParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
   const result = await ParcelServices.getAllParcel();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All parcels retrieved successfully",
        data: result.data,
        meta: result.meta

    })
})

const getParcelById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user;
    const parcelId = req.params.id;
    
   const parcel = await ParcelServices.getParcelById(parcelId, decodedToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Parcels retrieved successfully",
        data: parcel

    })
})

const getMyParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const decodedToken= req.user;
    const query = req.query;
   const result = await ParcelServices.getMyParcels(decodedToken, query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All parcels retrieved successfully",
        data: result.data,
        meta: result.meta

    })
})

const cancelParcel = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const decodedToken = req.user;
    const parcel = await ParcelServices.cancelParcel(id, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: false,
        message: "Parcel canceled successfully",
        data: parcel 
    })
})

const updateParcel =  catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;
    const decodedToken = req.user;
    const parcel = await ParcelServices.updateParcel(id, payload, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Parcel status updated successfully",
        data: parcel 
    })
})

const getParcelStatusLog = catchAsync(async(req: Request, res:Response, next: NextFunction) => {

    const parcelId = req.params.id;
    const decodedToken = req.user;
    const parcelStatusLog = await ParcelServices.getParcelStatusLog(parcelId, decodedToken)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Parcel status log retrieved successfully",
        data: parcelStatusLog
    })
})



export const ParcelController = {
    createParcel,
    getAllParcel,
    getParcelById,
    getMyParcels,
    cancelParcel,
    updateParcel,
    getParcelStatusLog
}