import bcrypt from "bcryptjs";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import userModel from "../models/user.model";
import { TokenPayload, Tokens } from "../interfaces/auth.interface";

import { imagekit } from "../config/imagekit";

import fs from "fs"; 

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  text: string;
}

class Utility {
  private async generateSalt(): Promise<string> {
    return await bcrypt.genSalt(10);
  }

  public async getHashPassword(password: string): Promise<string> {
    const salt = await this.generateSalt();
    return await bcrypt.hash(password, salt);
  }

  public async validatePassword(raw: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(raw, hash);
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log("Email details:", options);

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_ID!,
        to: options.email,
        subject: options.subject,
        text: options.text,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.email}`);
      return true;
    } catch (error: any) {
      console.error("Failed to send email:", error.message || error);
      return false;
    }
  }

  // Generate a random 6-digit OTP
  public generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async generateAccessAndRefreshToken(payload: TokenPayload): Promise<Tokens> {
    try {
      const accessToken = Jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: "24h" });
      const refreshToken = Jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: "7d" });

      await userModel.findByIdAndUpdate(payload.id, { refreshToken });
      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new Error("Error while generating the tokens");
    }
  }

  public async verifyJwtToken(token: string): Promise<any | null> {
    return Jwt.verify(token, process.env.JWT_SECRET_KEY!) as any;
  }
  
  public async generateOTPToken(email: string):Promise<string>{
    try {
      const otpToken = Jwt.sign({email}, process.env.JWT_SECRET_KEY!, { expiresIn: "5m" });

      return otpToken;
    } catch (error: any) {
      throw new Error("Error while generating the otp token: " + error.message);
    }
  }
  public async uploadMedia(file: Express.Multer.File): Promise<any> {
    try {
      // ✅ Ensure `file.buffer` is available (for `memoryStorage()`)
      const fileBuffer = file.buffer || fs.readFileSync(file.path); // ✅ Fallback for `diskStorage()`

      return await imagekit.upload({
        file: fileBuffer, // ✅ Handle both memory and disk storage cases
        fileName: `${Date.now()}_${file.originalname}`,
        folder: "uploads",
      });
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
 public  generateReferralCode():string{
    return  crypto.randomBytes(4).toString("hex"); // Example: "a1b2c3d4"
}
}

export default new Utility();
