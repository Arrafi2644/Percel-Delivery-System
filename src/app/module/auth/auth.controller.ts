/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from '../../utils/setCookie';
import { catchAsync } from '../../utils/catchAsync';
import AppError from '../../errorHelpers/appError';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loginInfo = await AuthServices.credentialsLogin(req.body)

  const userTokens = {
    accessToken: loginInfo.accessToken,
    refreshToken: loginInfo.refreshToken
  }
  setAuthCookie(res, userTokens)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login Successfully",
    data: {
      accessToken: loginInfo.accessToken,
      refreshToken: loginInfo.refreshToken,
      user: loginInfo.user
    }
  })

})

const logout = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout Successfully",
    data: null
  })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found")
  }

  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

  setAuthCookie(res, tokenInfo)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Access Token Retrieve Successfully",
    data: tokenInfo

  })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const decodedToken = req.user;

  AuthServices.resetPassword(oldPassword, newPassword, decodedToken)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Changed Successfully",
    data: null

  })
})

export const AuthController = {
  credentialsLogin,
  resetPassword,
  getNewAccessToken,
  logout
}