
import utility from "../utils/utility";

import { CustomError } from "../utils/custom-error";
import { ILogin, IRegister, IResetPassword, ISocialLogin, IUpdatePassword, IUpdateUser } from "../interfaces/auth.interface";
import { IUser } from "../models/user.model";
import { AuthRepository } from "../repositories/auth.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Schema } from "mongoose";
import { logger } from "../utils/logger";

export class AuthService {

  constructor(private authRepository: AuthRepository = new AuthRepository()) { }

  async create(payload: IRegister): Promise<void> {
    if (payload.password !== payload.confirmPassword) {
      throw new CustomError("Passwords do not match", HTTP_STATUS.BAD_REQUEST);
    }
    const isUserAlreadyExist = await this.authRepository.findUserByEmail(
      payload.email,
    );
    if (isUserAlreadyExist && isUserAlreadyExist.isEmailVerified) {
      throw new CustomError("Email already in use", HTTP_STATUS.BAD_REQUEST);
    }
    const otp = utility.generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
    if (isUserAlreadyExist && !isUserAlreadyExist.isEmailVerified) {
      await this.authRepository.updateUser(isUserAlreadyExist._id as Schema.Types.ObjectId, { otp, otpExpiredAt: otpExpiration });
    } else {

      const hashPassword = await utility.getHashPassword(payload.password);
      const user = await this.authRepository.createUser({ ...payload, password: hashPassword, otp, otpExpiredAt: otpExpiration, provider: "email" });
    }
    await utility.sendEmail({ email: payload.email, subject: "Verify your email", text: `Your OTP is ${otp}` });
    logger.info('OTP sent for signup email verification');

  }
  async verifyEmailForResetPassword(email: string): Promise<any> {
    const user = await this.authRepository.findUserWithFilters({ email, isEmailVerified: true });
    if (!user) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    const otp = utility.generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
    await this.authRepository.updateUser(user._id as Schema.Types.ObjectId, { otp, otpExpiredAt: otpExpiration });
    await utility.sendEmail({ email, subject: "Reset Password OTP", text: `Your OTP is ${otp}` });

  }
  async verifyOtpForResetPassword(email: string, otp: string): Promise<IUser> {
    const user = await this.authRepository.findUserWithFilters({ email, isEmailVerified: true });
    console.log(user)
    if (!user) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    if (!user.otp || user.otp !== otp || (user?.otpExpiredAt && user.otpExpiredAt < new Date())) {
      throw new CustomError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }
    const payload = { otp: null, otpExpiredAt: null };
    return await this.authRepository.updateUser(user._id as Schema.Types.ObjectId, payload);
  }
  async resetPassword(payload: IResetPassword): Promise<IUser> {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new CustomError("Passwords do not match", HTTP_STATUS.BAD_REQUEST);
    }
    const decodedOtpToken = await utility.verifyJwtToken(payload.otpToken) as { email: string } | null;
    if (!decodedOtpToken || decodedOtpToken.email !== payload.email) {
      throw new CustomError("Invalid OTP Token", HTTP_STATUS.BAD_REQUEST);
    }
    const filter = { email: payload.email, isEmailVerified: true };
    const user = await this.authRepository.findUserWithFilters(filter);
    if (!user) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const hashPassword = await utility.getHashPassword(payload.newPassword);
    return await this.authRepository.updateUser(user._id as Schema.Types.ObjectId, { password: hashPassword });
  }
  async logInUser(payload: ILogin): Promise<IUser> {
    const user = await this.authRepository.findUserWithFilters({ email: payload.email, isActive: true, isEmailVerified: true });
    if (
      !user ||
      !(await utility.validatePassword(payload.password, user.password!))
    ) {
      throw new CustomError("Invalid credentials", HTTP_STATUS.BAD_REQUEST);
    }
    return user;
  }
  async logInAdmin(payload: ILogin): Promise<IUser> {
    const user = await this.authRepository.findUserWithFilters({ email: payload.email, isActive: true, isEmailVerified: true });
    if (
      !user ||
      !(await utility.validatePassword(payload.password, user.password!)) ||
      user.role !== 'admin'

    ) {
      throw new CustomError("Invalid credentials", HTTP_STATUS.BAD_REQUEST);
    }
    return user;
  }
  async verifyEmail(email: string, otp: string): Promise<IUser> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    if (user.isEmailVerified) {
      throw new CustomError("Email already verified", HTTP_STATUS.BAD_REQUEST);
    }
    if (!user.otp || user.otp !== otp || (user?.otpExpiredAt && user.otpExpiredAt < new Date())) {
      throw new CustomError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }
    const payload = { isEmailVerified: true, otp: null, otpExpiredAt: null };
    const newUser = await this.authRepository.updateUser(user._id as Schema.Types.ObjectId, payload);
    if (newUser && newUser.referredBy) {
      await this.authRepository.rewardReferrer(newUser.referredBy);
      await this.authRepository.createReferralHistory(newUser?._id, newUser.referredBy)
    }
    await this.authRepository.rewardSignupBonus(newUser._id);
    return newUser;
  }
  async editUser(id: Schema.Types.ObjectId, payload: IUpdateUser): Promise<IUser> {
    if (!payload.name && !payload.country) {
      throw new CustomError("Please provide at least one field to update", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.authRepository.updateUser(id, payload);
  }
  async logoutUser(userId: Schema.Types.ObjectId): Promise<any> {
    return await this.authRepository.updateUser(userId, { refreshToken: null });
  }
  async getUser(id: Schema.Types.ObjectId): Promise<IUser | null> {
    return await this.authRepository.findUserById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.authRepository.findUserByEmail(email);
  }
  async handleSocialLogin(payload: ISocialLogin): Promise<IUser> {
    const user = await this.authRepository.findUserByEmail(payload.email);
    if (user) return user;
    return await this.authRepository.handleSocialLogin(payload);
  }

  async deleteUser(id: Schema.Types.ObjectId): Promise<IUser> {
    return await this.authRepository.deleteUserById(id);
  }
  async updateWalletBalance(userId: Schema.Types.ObjectId, currency: string, network: string, amount: number, des : string, transactionType:string): Promise<void> {
    await this.authRepository.updateWalletBalance(userId, currency, amount, network, des, transactionType);
  }
  async updatePassword(
    id: Schema.Types.ObjectId,
    payload: IUpdatePassword
  ): Promise<IUser> {
    if (!payload.newPassword || !payload.oldPassword) {
      throw new CustomError("Please provide old and new password", 400);
    }
    const user = await this.authRepository.findUserById(id);
    if (
      !user ||
      !(await utility.validatePassword(payload.oldPassword, user.password!))
    ) {
      throw new CustomError("Invalid password", 400);
    }
    const newPassword = await utility.getHashPassword(payload.newPassword);
    return await this.authRepository.updateUser(id, { password: newPassword });
  }
}
