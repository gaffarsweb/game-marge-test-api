import { Schema } from "mongoose";
import { withdrawServices } from "../repositories/withdraw.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";
import { Response } from "express";

export class WithdrawServices {

    constructor(private WithdrawServicess: withdrawServices = new withdrawServices()) { }

    async sendWithdrawRequest(userId: any, withdrawAmount: number, withdrawToAddress: string, currency: string, selectedNetwork: string) {
        const wallet = await this.WithdrawServicess.sendWithdrawRequest(userId, withdrawAmount, withdrawToAddress, currency, selectedNetwork);
        return wallet;
    }
    async verifyWithdrawRequest(userId: any, requestId:Schema.Types.ObjectId, OTP:number) {
        const wallet = await this.WithdrawServicess.verifyWithdrawRequest(userId, requestId, OTP);
        return wallet;
    }
    async resentWithdrawRequestVerification(userId: any, requestId:Schema.Types.ObjectId) {
        const wallet = await this.WithdrawServicess.resentWithdrawRequestVerification(userId, requestId);
        return wallet;
    }
    async allWithdrawalRequests(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, userId:string, isExport?: string }, res:Response) {
        const wallet = await this.WithdrawServicess.allWithdrawalRequests(query, res);
        return wallet;
    }
    async approveRequest(userId: any, requestId:Schema.Types.ObjectId) {
        const wallet = await this.WithdrawServicess.approveRequest(userId, requestId);
        return wallet;
    }
    async rejectRequest(userId: any, requestId: Schema.Types.ObjectId) {
        const result = await this.WithdrawServicess.rejectRequest(userId, requestId);
        return result;
    }
}