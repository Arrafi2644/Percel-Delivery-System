import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";
import { catchAsync } from "../../middleware/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User Created Successfully",
        data: user
    })

})

export const userController = {
    createUser
}