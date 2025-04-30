import { Schema, SortOrder } from "mongoose";
import transactions from "../models/inGameCoinTransations.model";
import TransactionsModel from "../models/transaction.model"
import { transactionType } from "../utils/enums";

export class transactionsRepository {

    async getAllInGameCoinTransactions(userId: any): Promise<any> {

        // Sorting by _id in descending order to get newest transactions first
        const result = await transactions.find({ userId })
            .sort({ _id: -1 })  // Descending order
            .lean();

        const count = await transactions.countDocuments({ userId });

        return { data: result, count };
    }

    async getCoinsTransactions(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string }): Promise<any> {
        try {
            const page = query.page ? parseInt(query.page, 10) : 1;
            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            const search = query.search ?? '';
            const sortOrder = query.sort ? Number(query.sort) : -1;
            const filter = query.filter ? JSON.parse(query.filter) : {};

            let matchCondition: any = {
                transactionType: {
                    $in: [transactionType.BUY_GAMERGE_CREDIT, transactionType.BUY_GAMERGE_DEBIT]
                }
            };

            if (filter.transactionType) {
                matchCondition.transactionType = filter.transactionType;
            }

            const aggregationPipeline: any[] = [
                { $match: matchCondition },
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ];

            if (search) {
                aggregationPipeline.push({
                    $match: {
                        "user.name": { $regex: search, $options: "i" }
                    }
                });
            }

            aggregationPipeline.push(
                {
                    $project: {
                        transactionAmount: 1,
                        transactionType: 1,
                        transactionStatus: 1,
                        currency: 1,
                        network: 1,
                        remarks: 1,
                        createdAt: 1,
                        "user.name": 1,
                        "user.email": 1
                    }
                },
                { $sort: { createdAt: sortOrder as SortOrder } },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );

            const transactions = await TransactionsModel.aggregate(aggregationPipeline);

            if (transactions.length === 0) {
                return {
                    status: false,
                    code: 400,
                    msg: "Transactions not found."
                };
            }

            const totalResult = await TransactionsModel.countDocuments(matchCondition);

            return {
                status: true,
                code: 200,
                data: {
                    transactions,
                    page,
                    limit,
                    totalResult
                }
            };

        } catch (error) {
            console.error("Error while fetching buying transactions:", error);
            return {
                status: false,
                code: 500,
                msg: error instanceof Error ? error.message : 'Internal server error'
            };
        }
    }
    async getAllTransations(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string, userId: string }): Promise<any> {
        try {
            const aggregationPipeline: any[] = [
                {
                    $match: {
                        userId: query?.userId
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        transactionAmount: 1,
                        transactionType: 1,
                        transactionStatus: 1,
                        currency: 1,
                        network: 1,
                        remarks: 1,
                        createdAt: 1,
                        "user.name": 1,
                        "user.email": 1
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ];

            const transactions = await TransactionsModel.find({ userId: query?.userId });

            if (transactions.length === 0) {
                return {
                    status: false,
                    code: 400,
                    msg: "No transactions found for this user."
                };
            }

            return {
                status: true,
                code: 200,
                data: {
                    transactions,
                    totalResult: transactions.length
                }
            };

        } catch (error) {
            console.error("Error while fetching all transactions for user:", error);
            return {
                status: false,
                code: 500,
                msg: error instanceof Error ? error.message : 'Internal server error'
            };
        }
    }



}
