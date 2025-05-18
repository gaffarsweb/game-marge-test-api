import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { AuthService } from "../services/auth.service";
import utility from "../utils/utility";
import admin from '../config/firebase';


import { CustomError } from "../utils/custom-error";
import { CustomRequest, ILogin, IRegister, IResetPassword, IUpdatePassword, IUpdateUser, TokenPayload } from "../interfaces/auth.interface";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
import { DecodedIdToken } from "firebase-admin/auth";
import permissionModel from "../models/permission.model";


class AuthController {
  constructor(private authService: AuthService = new AuthService()) { }


  addAdmin = async (req: Request, res: Response): Promise<any> => {
    const payload = req.body as IRegister
    try {
      const result = await this.authService.addAdmin(payload);
      if (result) {
        return sendSuccessResponse(res, `Admin added successfully. ${payload?.email} has received a verification email.`, null, HTTP_STATUS.CREATED);
      }
    } catch (error: any) {
      logger.error(`${error.message || "Error while registering user"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message)
    }
  };
  signupRequest = async (req: Request, res: Response): Promise<any> => {
    const payload = req.body as IRegister
    try {
      await this.authService.create(payload);
      return sendSuccessResponse(res, HTTP_MESSAGE.CREATED, "OTP sent successfully", HTTP_STATUS.CREATED);
    } catch (error: any) {
      logger.error(`${error.message || "Error while registering user"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error.message, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message)
    }
  };
  verifyOtpAndSignup = async (req: Request, res: Response): Promise<any> => {
    const { email, otp: incomingOtp } = req.body;

    try {
      const verifiedUser = await this.authService.verifyEmail(email, incomingOtp);
      const { password, otp, otpExpiredAt, ...user } = verifiedUser.toObject();
      const tokenPayload = { id: user._id, email: user.email, role: user.role } as TokenPayload;
      const { accessToken, refreshToken } = await utility.generateAccessAndRefreshToken(tokenPayload);
      const option = {
        httpOnly: true,
        sercure: true,
      };
      res
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
      const responseData = { user, accessToken, refreshToken }
      return sendSuccessResponse(res, "Email verified successfully", responseData);
    } catch (error: any) {
      logger.error(`${error.message || "Error verifying email"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message);
    }


  };
  verifyOtpForAdmin = async (req: Request, res: Response): Promise<any> => {
    const { email, otp: incomingOtp } = req.body;

    try {
      const verifiedUser = await this.authService.verifyEmailForAdmin(email, incomingOtp);
      const { password, otp, otpExpiredAt, ...user } = verifiedUser.toObject();
      const tokenPayload = { id: user._id, email: user.email, role: user.role } as TokenPayload;
      const { accessToken, refreshToken } = await utility.generateAccessAndRefreshToken(tokenPayload);
      const option = {
        httpOnly: true,
        sercure: true,
      };
      res
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option);
      const permissions = await permissionModel.findOne({ userId: user._id });
      console.log(permissions)
      const responseData = { user, accessToken, refreshToken, permissions }
      return sendSuccessResponse(res, "Email verified successfully", responseData);
    } catch (error: any) {
      logger.error(`${error.message || "Error verifying email"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message);
    }


  };



  // User Login
  handleUserLogin = async (req: Request, res: Response): Promise<any> => {
    const payload = req.body as ILogin;
    try {
      const loggedInUser = await this.authService.logInUser(payload);
      const { password, otp, otpExpiredAt, ...user } = loggedInUser.toObject();
      const tokenPayload = { id: user._id, email: user.email, role: user.role } as TokenPayload;
      const { accessToken, refreshToken } = await utility.generateAccessAndRefreshToken(tokenPayload);
      const option = {
        httpOnly: true,
        sercure: true,
      };
      res
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
      const responseData = { user, accessToken, refreshToken }
      return sendSuccessResponse(res, HTTP_MESSAGE.OK, responseData);

    } catch (error: any) {
      logger.error(`${error.message || "Error logging user"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message)
    }
  };
  // User Login
  handleAdminLogin = async (req: Request, res: Response): Promise<any> => {
    const payload = req.body as ILogin;
    try {
      await this.authService.logInAdmin(payload);
      return sendSuccessResponse(res, `OTP Sent to the email:${payload.email}`);
    } catch (error: any) {
      logger.error(`${error.message || "Error logging admin"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message)
    }
  };

  // LOGOUT
  handleLogout = async (req: CustomRequest, res: Response): Promise<any> => {
    const userId = req.user?.id!;
    try {
      await this.authService.logoutUser(userId);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return sendSuccessResponse(res, "User logged out successfully.");
    } catch (error: any) {
      logger.error(`${error.message || "Error logging out user"}`);
      return sendErrorResponse(res, error.message || "Error logging out user");
    }
  };
  // Update User Profile
  updateProfile = async (req: CustomRequest, res: Response): Promise<any> => {
    const payload = req.body as IUpdateUser;
    const userId = req.user?.id!;
    try {
      const result = await this.authService.editUser(userId, payload);
      return sendSuccessResponse(res, "Profile updated.", result);
    } catch (error: any) {
      logger.error(`${error.message || "Error updating user profile"}`);
      return sendErrorResponse(res, error.message || "Error updating user profile ");
    }
  };

  // Social Login
  socialLogin = async (req: Request, res: Response): Promise<any> => {
    const { idToken, isEmailVerified } = req.body;
    if (!idToken) {
      return sendErrorResponse(res, "", "ID token is required", HTTP_STATUS.BAD_REQUEST);
    }
    try {
      const decodedToken: DecodedIdToken = await admin
        .auth()
        .verifyIdToken(idToken);


      const { email, name, picture, provider_id } = decodedToken;

      const payload = {
        email: email || req.body.email || "",
        firstName:req.body.firstName || name || "",      
        lastName:req.body.lastName || "",      
        avatarUrl: picture || req.body.avatarUrl || "",
        provider: provider_id || req.body.provider || "",
        isEmailVerified: isEmailVerified || false
      };


      const user = await this.authService.handleSocialLogin(payload);
      const tokenPayload = { id: user._id, email: user.email, role: user.role } as TokenPayload;
      const { accessToken, refreshToken } = await utility.generateAccessAndRefreshToken(tokenPayload);
      const option = {
        httpOnly: true,
        sercure: true,
      };
      res
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
      const responseData = { user, accessToken, refreshToken }
      return sendSuccessResponse(res, HTTP_MESSAGE.OK, responseData);

    } catch (error: any) {
      logger.error("Error while social logging:", error);
      return sendErrorResponse(res, error, error.message);
    }
  };

  // Get User Profile
  getProfile = async (req: CustomRequest, res: Response): Promise<any> => {
    const userId = req.user?.id!;
    try {
      const user = await this.authService.getUser(userId);
      if (!user) {
        logger.error("User not found");
        return sendErrorResponse(res, HTTP_MESSAGE.NOT_FOUND, "User not found", HTTP_STATUS.NOT_FOUND);
      }
      const { password, refreshToken, ...others } = user.toObject();
      return sendSuccessResponse(res, HTTP_MESSAGE.OK, others);
    } catch (error: any) {
      logger.error(`${error.message || "Error fetching user profile"}`);
      return sendErrorResponse(res, error, error.message || "Error while fetching user profile");
    }
  };

  // Update Password

  updatePassword = async (req: CustomRequest, res: Response): Promise<any> => {
    const userId = req.user?.id!;
    const payload = req.body as IUpdatePassword;

    try {
      await this.authService.updatePassword(userId, payload);
      return sendSuccessResponse(res, "Password updated successfully");
    } catch (error: any) {
      logger.error(`${error.message || "Error updating user password"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message || "Error while updating user password");
    }
  };

  forgotPasswordRequest = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    try {
      await this.authService.verifyEmailForResetPassword(email);
      return sendSuccessResponse(res, "OTP sent successfully");
    } catch (error: any) {
      logger.error(`${error.message || "Error verifying email"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message || "Error verifying email");
    }
  };
  forgotPasswordRequestadmin = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    try {
      await this.authService.verifyEmailForResetPasswordAdmin(email);
      return sendSuccessResponse(res, "OTP sent successfully");
    } catch (error: any) {
      logger.error(`${error.message || "Error verifying email"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message || "Error verifying email");
    }
  };

  verifyOtpForReset = async (req: Request, res: Response): Promise<any> => {
    const { email, otp } = req.body;

    try {
      await this.authService.verifyOtpForResetPassword(email, otp);
      const otpToken = await utility.generateOTPToken(email);
      return sendSuccessResponse(res, "OTP verified successfully", { otpToken });

    } catch (error: any) {
      logger.error(`${error.message || "Error verifying OTP"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message || "Error verifying OTP");
    }
  };


  resetPassword = async (req: Request, res: Response): Promise<any> => {
    const payload = req.body as IResetPassword;
    try {
      await this.authService.resetPassword(payload);
      return sendSuccessResponse(res, "Password reset successfully");

    } catch (error: any) {
      logger.error(`${error.message || "Error resetting password"}`);
      if (error instanceof CustomError) {
        return sendErrorResponse(res, error, error.message, error.statusCode);
      }
      return sendErrorResponse(res, error, error.message || "Error resetting password");
    }

  };
  refreshToken = async (req: Request, res: Response): Promise<any> => {
    const incomingRefreshToken =
      req.headers["authorization"]?.split(" ")[1] ||
      req.cookies.refreshToken ||
      req.body.refreshToken ||
      req.headers["refreshToken"]

    if (!incomingRefreshToken) return sendErrorResponse(res, "", "No refresh token found", HTTP_STATUS.NOT_FOUND);
    try {
      const decodedToken = await utility.verifyJwtToken(incomingRefreshToken);
      if (!decodedToken) return sendErrorResponse(res, "", HTTP_MESSAGE.FORBIDDEN, HTTP_STATUS.UNAUTHORIZED);
      const isUserAlreadyExist = await this.authService.getUser(decodedToken.id);
      if (!isUserAlreadyExist) return sendErrorResponse(res, "", HTTP_MESSAGE.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      const { password, otp, otpExpiredAt, ...user } = isUserAlreadyExist.toObject();
      const tokenPayload = { id: user._id, email: user.email, role: user.role } as TokenPayload;
      const { accessToken, refreshToken } = await utility.generateAccessAndRefreshToken(tokenPayload);
      const option = {
        httpOnly: true,
        sercure: true,
      };
      res
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
      const responseData = { user, accessToken, refreshToken }
      return sendSuccessResponse(res, HTTP_MESSAGE.OK, responseData);
    } catch (error: any) {
      return sendErrorResponse(res, error, error.message || "Error refreshing token");
    }
  };

}

export default new AuthController();
