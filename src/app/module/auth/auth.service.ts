import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userTokens';
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs"
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload

    const isUserExist = await User.findOne({ email })
    // console.log("user is ", isUserExist);
    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password!")
    }

    const userTokens = createUserTokens(isUserExist)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}

const getNewAccessToken = async(refreshToken: string) => {
        const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

        return {
           accessToken: newAccessToken
        }
}

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId)
    if (!user) {
        throw new AppError(httpStatus.FORBIDDEN, "User not found")
    }
 
    const isPasswordMatched = await bcryptjs.compare(oldPassword, user.password as string)
    if(!isPasswordMatched){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password not matched")
    }

    user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))
    user.save()

}

export const AuthServices = {
    credentialsLogin,
    resetPassword,
    getNewAccessToken
}