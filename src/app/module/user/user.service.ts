import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs"
import { envVars } from '../../config/env';

const createUser = async(payload: Partial<IUser>) => {
  const {email, password, ...rest} = payload;
console.log("user info ", payload);

const isUserExist = await User.findOne({email})

if(isUserExist){
  throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
}

const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: authProvider,
    ...rest
  })

  return user

}

export const UserServices = {
    createUser
}