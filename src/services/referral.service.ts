import { Schema } from "mongoose";
import { referralRepository } from "../repositories/referral.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";

export class ReferralServices {

    constructor(private ReferralServicess: referralRepository = new referralRepository()) { }

    async getReferralHistory(userId: any) {
        const wallet = await this.ReferralServicess.getReferralHistory(userId);
        if (!wallet) throw new CustomError("No history found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async getAllReferralHistory(query: object) {
        const wallet = await this.ReferralServicess.getAllReferralHistory(query);
        if (!wallet) throw new CustomError("No history found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async getReferralListByUserId(query: object, userId: Schema.Types.ObjectId) {
        const wallet = await this.ReferralServicess.getReferralListByUserId(query, userId);
        if (!wallet) throw new CustomError("No history found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
}