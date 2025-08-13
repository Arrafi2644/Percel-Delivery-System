import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs"
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  console.log("user info ", payload);

  const isUserExist = await User.findOne({ email })

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

  const authProvider: IAuthProvider = { provider: "credential", providerId: email as string }

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: authProvider,
    ...rest
  })

  return user

}

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.FORBIDDEN, "User not found")
  }
  if (!isUserExist._id.equals(decodedToken.userId)) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
  }

  if (payload.role) {
    if (decodedToken.role === Role.RECEIVER || decodedToken.role === Role.SENDER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
      if (decodedToken.role === Role.RECEIVER || decodedToken.role === Role.SENDER) {
        throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
      }
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
  }

  const newUpdatePassword = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })
  return newUpdatePassword;
}

export const UserServices = {
  createUser,
  updateUser
}