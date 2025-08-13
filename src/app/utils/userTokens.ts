import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IsActive, IUser } from "../module/user/user.interface";
import { User } from "../module/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import AppError from "../errorHelpers/appError";

export const createUserTokens = (user: Partial<IUser>) => {
    
    const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken( tokenPayload ,envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
    const refreshToken = generateToken(tokenPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)


    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async(refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload

    const isUserExist = await User.findOne({email: verifiedRefreshToken.email})
    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }

    if(isUserExist.isActive === IsActive.INACTIVE || isUserExist.isActive === IsActive.BLOCKED){
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }

        if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

     const tokenPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(tokenPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
    return accessToken;
}
