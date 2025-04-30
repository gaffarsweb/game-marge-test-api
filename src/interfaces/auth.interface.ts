import mongoose, { Schema } from "mongoose";
import { Request } from "express";
import { IUser } from "../models/user.model";



export interface IAuthRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserWithFilters(filters: IFilters): Promise<IUser | null>;
  createUser(payload: IRegister): Promise<IUser>;
  updateUser(id: Schema.Types.ObjectId, payload: IUpdateUser): Promise<IUser>;
  findUserById(id: Schema.Types.ObjectId): Promise<IUser | null>;
  handleSocialLogin(payload: ISocialLogin): Promise<IUser>;
  deleteUserById(id: Schema.Types.ObjectId): Promise<IUser>;
  rewardReferrer(referralCode: string):Promise<void>;
}
export interface IRegister{
  name: string;
  email: string;
  password: string;
  country:string;
  provider:string;
  confirmPassword?:string;
  referralCodeUsed?:string;
  role?:string;
  otp?: string;
  otpExpiredAt?: Date;
}
export interface ISocialLogin{
  name:string;
  email: string;
  avatarUrl: string;
  provider:string;
  isEmailVerified:boolean; 
}
export interface ILogin{
  email: string;
  password: string;
}
export interface IFilters{
  email?:string;
  name?:string;
  country?:string;
  role?:string;
  isEmailVerified?:boolean;
}
export interface IUpdatePassword{
  oldPassword: string;
  newPassword: string;
}
export interface IUpdateUser{
  name?: string;
  country?: string;
  password?: string;
  avatarUrl?: string;
  otp?:string | null;
  otpExpiredAt?: Date | null;
  isEmailVerified?: boolean;
  refreshToken?: string | null;
  isActive?: boolean;
  role?:string;
}
export interface TokenPayload{
  id:Schema.Types.ObjectId
  email:string,
  role:string

}

export interface Tokens{
  accessToken: string;
  refreshToken: string;
}
export interface CustomRequest extends Request{
  user?:TokenPayload
  file?: Express.Multer.File;
}
export interface IResetPassword{
  email:string;
  newPassword: string;
  confirmPassword?: string;
  otpToken: string;
}