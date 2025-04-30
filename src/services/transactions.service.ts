import { Schema } from "mongoose";
import { transactionsRepository } from "../repositories/transactions.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";

export class TransatctionsServices {

    constructor(private transactions: transactionsRepository = new transactionsRepository()) { }

    async getAllInGameCoinTransactions(userId: any) {
        const transactions = await this.transactions.getAllInGameCoinTransactions(userId);
        if (transactions?.data.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }

    async getCoinsTransactions(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string }) {
        const transactions = await this.transactions.getCoinsTransactions(query);
        if (transactions?.data.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }
    async getAllTransations(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, userId:string }) {
        const transactions = await this.transactions.getAllTransations(query);
        if (transactions?.data?.transactions.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }
}