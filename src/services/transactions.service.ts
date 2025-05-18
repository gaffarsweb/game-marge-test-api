import { Schema } from "mongoose";
import { transactionsRepository } from "../repositories/transactions.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";
import { Response } from "express";

export class TransatctionsServices {

    constructor(private transactions: transactionsRepository = new transactionsRepository()) { }

    async getAllInGameCoinTransactions(userId: any, query:any) {
        const transactions = await this.transactions.getAllInGameCoinTransactions(userId, query);
        if (transactions?.data.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }

    async getCoinsTransactions(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, isExport?: boolean}, res?: Response) {
        const transactions = await this.transactions.getCoinsTransactions(query, res);
        if (transactions?.data.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }
    async getAllTransations(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, userId:string }) {
        const transactions = await this.transactions.getAllTransations(query);
        if (transactions?.data?.transactions.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }

    async getAllTransactionsForAdmin(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, userId:string, isExport?: string }, res?: Response) {
        const transactions = await this.transactions.getAllTransactionsForAdmin(query, res);
        if (transactions?.data?.transactions.length === 0) throw new CustomError("No transactions found", HTTP_STATUS.NOT_FOUND);
        return transactions;
    }
}