import { Request, Response } from "express";
import { UserServices } from "../services/user.service";
import { CustomRequest, IUpdateUser } from "../interfaces/auth.interface";
import { Schema } from "mongoose";
import { sendSuccessResponse, sendErrorResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { CustomError } from "../utils/custom-error";
import { IPagination } from "../interfaces/news.interface";

class UserController {
  constructor(private userService: UserServices = new UserServices()) { }

  updateUserProfile = async (req: CustomRequest, res: Response): Promise<any> => {
    const payload = req.body as IUpdateUser;
    const userId = req.user?.id!;
    try {
      const result = await this.userService.editUser(userId, payload);
      return sendSuccessResponse(res, "Profile updated.", result);
    } catch (error: any) {
      logger.error(`${error.message || "Error updating user profile"}`);
      return sendErrorResponse(res, error.message || "Error updating user profile ");
    }
  };
  updateUserStatus = async (req: any, res: Response): Promise<any> => {
    const userId = req.body.id;

    if (!userId) {
      return sendErrorResponse(res, "User ID is required.");
    }
    try {
      const result = await this.userService.updateStatus(userId);
      return sendSuccessResponse(res, "Profile updated.", result);
    } catch (error: any) {
      logger.error(`${error.message || "Error updating user profile"}`);
      return sendErrorResponse(res, error.message || "Error updating user profile");
    }
  };


  deleteUser = async (req: Request, res: Response): Promise<any> => {
    const userId = (req.params.id as any) as Schema.Types.ObjectId;
    try {
      await this.userService.deleteUser(userId);
      return sendSuccessResponse(res, "User deleted successfully");
    } catch (error: any) {
      return sendErrorResponse(res, error, error.message);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<any> => {
    const userId = (req.params.id as any) as Schema.Types.ObjectId;
    try {
      const user = await this.userService.getUserById(userId);
      return sendSuccessResponse(res, "User found", user);
    } catch (error: any) {
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message);
    }
  }

  getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      const { page = 1, limit = 10 , sort = 1, filter, search } =  req.query as unknown as IPagination; 
      const users = await this.userService.getAllUsers({page, limit, sort, filter, search});
      return sendSuccessResponse(res, "Users found", users);
    } catch (error: any) {
      return sendErrorResponse(res, error, error.message);
    }
  }
  
  getAllReferredUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      const { referralCode } = req.params;
      const referredUsers = await this.userService.findAllUsersReferredByAUser(referralCode as string);
      return sendSuccessResponse(res, "Referred users found", referredUsers);
    } catch (error: any) {
      logger.error(`Error retrieving referred users:error: ${error}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message);
    }
  }
  getAllAdmins = async (req: Request, res: Response): Promise<any> => {
    try {
      const query = req.query
      const admins = await this.userService.getAllAdmins(query);
      return sendSuccessResponse(res, "Referred users found", admins);
    } catch (error: any) {
      logger.error(`Error retrieving referred users:error: ${error}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message);
    }
  }
  // getWalletDetails = async (req: any, res: Response): Promise<any> => {
  //   try {
  //     // const {id} = req.params;
  //     const id = req?.user?.id!;

  //     const referredUsers = await this.userService.getWalletDetails(id as string);
  //     return sendSuccessResponse(res, "wallet found", referredUsers);
  //   } catch (error: any) {
  //     logger.error(`Error retrieving user wallet:error: ${error}`);
  //     if (error instanceof CustomError) {
  //       return sendErrorResponse(res, error, error.message, error.statusCode);
  //     }
  //     return sendErrorResponse(res, error, error.message);
  //   }
  // }
  // getNetwork = async (req: any, res: Response): Promise<any> => {
  //   try {
  //     // const {id} = req.params;
  //     const id = req?.user?.id!;
  //     const token = req?.query?.token!;

  //     const referredUsers = await this.userService.getNetwork(id as string, token as string);
  //     return sendSuccessResponse(res, "network found", referredUsers);
  //   } catch (error: any) {
  //     logger.error(`Error retrieving referred users:error: ${error}`);
  //     if (error instanceof CustomError) {
  //       return sendErrorResponse(res, error, error.message, error.statusCode);
  //     }
  //     return sendErrorResponse(res, error, error.message);
  //   }
  // }
  // getTokens = async (req: any, res: Response): Promise<any> => {
  //   try {
  //     // const {id} = req.params;
  //     const id = req?.user?.id!;

  //     const referredUsers = await this.userService.getTokens(id as string);
  //     return sendSuccessResponse(res, "tokens found", referredUsers);
  //   } catch (error: any) {
  //     logger.error(`Error retrieving referred users:error: ${error}`);
  //     if (error instanceof CustomError) {
  //       return sendErrorResponse(res, error, error.message, error.statusCode);
  //     }
  //     return sendErrorResponse(res, error, error.message);
  //   }
  // }
}

export default new UserController();
