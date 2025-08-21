import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs"
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { userSearchableFields } from './user.constant';

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

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
    throw new AppError(httpStatus.NOT_FOUND, "User not found")
  }

  if (decodedToken.role === Role.RECEIVER || decodedToken.role === Role.SENDER) {
    if (!isUserExist._id.equals(decodedToken.userId)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update another user");
    }
  }

  if (isUserExist.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin is not authorized to modify SuperAdmin");
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

// const getAllUser = async () => {
//   const users = await User.find({})
//   const totalUser = await User.countDocuments();

//   const 

//   return {
//     data: users,
//     meta: {
//       total: totalUser
//     }
//   }
// }

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder<IUser>(User.find(), query, userSearchableFields);

  const usersQuery = queryBuilder
    .search()
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersQuery.build(),
    queryBuilder.getMeta(),
  ]);


  return {
    data,
    meta,
  };
};


export const UserServices = {
  createUser,
  updateUser,
  getAllUser
}