import { Schema } from "mongoose";
import { UserRepository } from "../repositories/user.repository";
import { CustomError } from "../utils/custom-error";
import { IUpdateUser } from "../interfaces/auth.interface";
import { IUser } from "../models/user.model";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IPagination } from "../interfaces/news.interface";

export class UserServices {
  constructor(private userRepository: UserRepository = new UserRepository()) { }

  async updateStatus(id: any): Promise<IUser> {
    if (!id) {
      throw new CustomError("Please provide at least one field to update", HTTP_STATUS.BAD_REQUEST);
    }
    const updatedUser = await this.userRepository.updateStatus(id);
    return updatedUser;
  }


  async editUser(id: Schema.Types.ObjectId, payload: IUpdateUser): Promise<IUser> {
    if (!Object.keys(payload).length) {
      throw new CustomError("Please provide at least one field to update", HTTP_STATUS.BAD_REQUEST);
    }
    const updatedUser = await this.userRepository.updateUser(id, payload);
    const { password, otp, otpExpiredAt, ...others } = updatedUser.toObject();
    return others;
  }
  async deleteUser(id: Schema.Types.ObjectId): Promise<void> {
    await this.userRepository.deleteUserById(id);
  }
  async getUserById(id: Schema.Types.ObjectId): Promise<IUser> {
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    const { password, otp, otpExpiredAt, ...others } = user.toObject();
    return others;
  }
  async getAllUsers(query: IPagination): Promise<{ data: any[]; count: number }> {
    const result = await this.userRepository.findAllUsers(query);

    if (!result || result.data.length === 0) {
      throw new CustomError("No users found", HTTP_STATUS.NOT_FOUND);
    }

    const users = result.data.map(user => {
      const { password, otp, otpExpiredAt, ...others } = user;
      return others;
    });

    return { data: users, count: result.count };
  }



  async findAllUsersReferredByAUser(referralCode: string): Promise<IUser[]> {
    if (!referralCode) {
      throw new CustomError("Referral code is required", HTTP_STATUS.BAD_REQUEST);
    }
    const users = await this.userRepository.getReferredUsers(referralCode);
    if (users.length === 0) throw new CustomError("No users found", HTTP_STATUS.NOT_FOUND);
    return users;
  }
  async getAllAdmins(query:any): Promise<IUser[]> {
    const users = await this.userRepository.getAllAdmins(query);
    if (users.length === 0) throw new CustomError("No users found", HTTP_STATUS.NOT_FOUND);
    return users;
  }
  // async getWalletDetails(id: string): Promise<any> {
  //   if (!id) {
  //     throw new CustomError("Referral code is required", HTTP_STATUS.BAD_REQUEST);
  //   }
  //   const data = await this.userRepository.getWalletDetails(id);
  //   // if(data.length===0) throw new CustomError("No data found",HTTP_STATUS.NOT_FOUND);
  //   return data;
  // }
  // async getNetwork(id: string, token:string): Promise<any> {
  //   if (!id) {
  //     throw new CustomError("player id is required", HTTP_STATUS.BAD_REQUEST);
  //   }
  //   const data = await this.userRepository.getNetwork(id, token);
  //   // if(data.length===0) throw new CustomError("No data found",HTTP_STATUS.NOT_FOUND);
  //   return data;
  // }
  // async getTokens(id: string): Promise<any> {
  //   if (!id) {
  //     throw new CustomError("player id is required", HTTP_STATUS.BAD_REQUEST);
  //   }
  //   const data = await this.userRepository.getTokens(id);
  //   // if(data.length===0) throw new CustomError("No data found",HTTP_STATUS.NOT_FOUND);
  //   return data;
  // }
}
