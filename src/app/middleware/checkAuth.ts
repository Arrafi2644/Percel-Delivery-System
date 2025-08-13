import { verifyToken } from './../utils/jwt';
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/appError";
import { envVars } from '../config/env';
import { User } from '../module/user/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { IsActive } from '../module/user/user.interface';

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError(httpStatus.BAD_REQUEST, "Token not received.")
        }
        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload
        // console.log("Verified token is ", verifiedToken);

        if (!verifiedToken) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid token")
        }

        const isUserExist = await User.findOne({ email: verifiedToken.email })

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }

        if (isUserExist.isActive === IsActive.INACTIVE || isUserExist.isActive === IsActive.BLOCKED) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.role}`)
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (!authRoles.includes(isUserExist.role)) {
            throw new AppError(httpStatus.BAD_REQUEST, "You are not permitted for this route")
        }

        req.user = verifiedToken;
        next()
    } catch (error) {
        console.log(error);
        next(error)
    }
}