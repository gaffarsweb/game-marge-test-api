import mongoose, { Schema, SortOrder } from "mongoose";
import transactions from "../models/inGameCoinTransations.model";
import TransactionsModel from "../models/transaction.model"
import { transactionType } from "../utils/enums";
import { networks } from "../networks/networks";
import { logger } from "../utils/logger";
import { Response } from "express";
import generateCSV from "../utils/export/generateCSV";
import dayjs from "dayjs";
import networksModel from "../models/networks.model";

export class transactionsRepository {

    async getAllInGameCoinTransactions(userId: any, query: any): Promise<any> {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const skip = (page - 1) * limit;

        const [result, count] = await Promise.all([
            transactions.find({ userId })
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            transactions.countDocuments({ userId })
        ]);

        return { data: result, count };
    }


    async getCoinsTransactions(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string, isExport?: boolean }, res?: Response): Promise<any> {
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

            if (filter?.date?.transactionsFrom && filter?.date?.transactionsTo) {
                const startDate = new Date(new Date(filter.date?.transactionsFrom).setHours(0, 0, 0, 0));
                const endDate = new Date(new Date(filter.date?.transactionsTo).setHours(23, 59, 59, 999));
                matchCondition.createdAt = {
                    $gte: startDate,
                    $lte: endDate,
                };
            }


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
                        "user.email": 1,
                        "user.avatarUrl": 1
                    }
                },
                { $sort: { createdAt: sortOrder as SortOrder } },

            );

            const countPipeline = [...aggregationPipeline];
            countPipeline.push({ $count: 'total' });

            if (!query?.isExport) {
                aggregationPipeline.push(
                    { $skip: (page - 1) * limit },
                    { $limit: limit }
                )
            }

            const transactions = await TransactionsModel.aggregate(aggregationPipeline);

            if (query?.isExport) {
                const headersMap: { [key: string]: string } = {
                    "User Name": "User Name",
                    "Transaction Amount": "Transaction Amount",
                    "Network": "Network",
                    "Currency": "Currency",
                    "Date & Time": "Date & Time",
                    "Transaction Type": "Transaction Type",
                    "Transaction Remark": "Transaction Remark",
                };

                const plainRecords = transactions.map((txn: any) => {
                    const record: any = {
                        "User Name": txn?.user?.name || "",
                        "Transaction Amount": txn?.transactionAmount || "",
                        "Network": txn?.network || "",
                        "Currency": txn?.currency || "",
                        "Date & Time": dayjs(txn?.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                        "Transaction Type": txn?.transactionType,
                        "Transaction Remark": txn?.remarks,
                    };

                    return record;
                });

                const fileName = `gamemergeCoinsTransactions-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
                await generateCSV(plainRecords, headersMap, fileName, res);

                return {
                    status: true,
                    code: 200,
                    data: "CSV file downloaded successfully"
                };
            }

            if (transactions.length === 0) {
                return {
                    status: false,
                    code: 400,
                    msg: "Transactions not found."
                };
            }

            const countResult = await TransactionsModel.aggregate(countPipeline);
            const totalResult = countResult[0]?.total || 0;

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
            logger.error("Error while fetching buying transactions:", error);
            return {
                status: false,
                code: 500,
                msg: error instanceof Error ? error.message : 'Internal server error'
            };
        }
    }
    async getAllTransations(query: {
        page?: string,
        limit?: string,
        sort?: string,
        search?: string,
        filter?: string,
        userId: string
    }): Promise<any> {
        try {
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const sort = Number(query.sort) || -1;
            const skip = (page - 1) * limit;

            const networks = await networksModel.find().sort({ _id: 1 });
            const filters = typeof query.filter === "string" ? JSON.parse(query.filter) : query.filter;
            let matchStage: any = { userId: new mongoose.Types.ObjectId(query.userId) };

            if (filters?.transactionStatus) {
                matchStage.transactionStatus = filters.transactionStatus;
            }

            if (filters?.transactionDate) {
                const startOfDay = new Date(new Date(filters.transactionDate).setHours(0, 0, 0, 0));
                const endOfDay = new Date(new Date(filters.transactionDate).setHours(23, 59, 59, 999));
                matchStage.createdAt = {
                    $gte: startOfDay,
                    $lte: endOfDay
                };
            }

            const aggregationPipeline: any[] = [
                {
                    $match: {
                        ...matchStage,
                        transactionType: { $ne: "admin_withdraw" }
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
                { $sort: { createdAt: sort } },
                { $skip: skip },
                { $limit: limit }
            ];

            let transactions: any = await TransactionsModel.aggregate(aggregationPipeline);

            if (transactions.length === 0) {
                return {
                    status: false,
                    code: 400,
                    msg: "No transactions found for this user."
                };
            }

            transactions = await Promise.all(
                transactions.map((element: any) => {
                    if (['admin_withdraw', 'reward', 'airDropClaim', 'winner_reward', 'buy_gamerge_credit', 'deposit'].includes(element.transactionType)) {
                        element.type = 'credit';
                    } else if (['spending', 'withdraw', 'buy_gamerge_debit'].includes(element.transactionType)) {
                        element.type = 'debit';
                    }

                    // Find matching network by currency
                    const matchedNetwork = networks.find(network => network.currency === element.currency);

                    if (matchedNetwork) {
                        return { ...element, currencyImg: matchedNetwork.image };
                    }

                    // Find matching token in any network's tokens
                    for (const network of networks) {
                        const matchedToken = network.tokens?.find(token => token.tokenSymbol === element.currency);
                        if (matchedToken) {
                            return { ...element, currencyImg: matchedToken.image };
                        }
                    }

                    return element;
                })
            );

            return {
                status: true,
                code: 200,
                data: {
                    transactions,
                    totalResult: transactions.length
                }
            };
        } catch (error) {
            logger.error("Error while fetching all transactions for user:", error);
            return {
                status: false,
                code: 500,
                msg: error instanceof Error ? error.message : 'Internal server error'
            };
        }
    }


    async getAllTransactionsForAdmin(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string, startDate?: string, endDate?: string, isExport?: string }, res?: Response): Promise<any> {
        try {
            const page = query.page ? parseInt(query.page, 10) : 1;
            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            const sortOrder = query.sort ? Number(query.sort) : -1;
            const search = query.search?.trim() ?? '';
            const filters = typeof query.filter === "string" ? JSON.parse(query.filter) : query.filter;
            const matchStage: any = {};
            if (filters?.date?.transactionsFrom && filters?.date?.transactionsTo) {
                matchStage.createdAt = {
                    $gte: new Date(new Date(filters.date.transactionsFrom).setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date(filters.date.transactionsTo).setHours(23, 59, 59, 999)),
                };
            }

            if (filters?.transactionType) {
                matchStage.transactionType = filters?.transactionType
            }

            if (filters?.network) {
                matchStage.network = filters?.network
            }

            if (filters?.currency) {
                matchStage.currency = filters?.currency
            }

            const aggregationPipeline: any[] = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'wallets',
                        localField: "userId",
                        foreignField: "userId",
                        as: "walletDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$walletDetails", preserveNullAndEmptyArrays: true
                    }
                },
                ...(search
                    ? [{
                        $match: {
                            $or: [
                                { 'user.name': { $regex: search, $options: 'i' } },
                                { 'network': { $regex: search, $options: 'i' } },
                                { 'currency': { $regex: search, $options: 'i' } },
                            ]

                        }
                    }]
                    : []),
                {
                    $project: {
                        transactionAmount: 1,
                        transactionType: 1,
                        transactionStatus: 1,
                        currency: 1,
                        network: 1,
                        remarks: 1,
                        createdAt: 1,
                        'user.name': 1,
                        'user.email': 1,
                        'user.avatarUrl': 1,
                        'walletDetails._id': 1,
                        'walletDetails.address': 1,
                        'walletDetails.balances': 1,
                        'walletDetails.createdAt': 1,
                    }
                },
                { $sort: { createdAt: sortOrder } },

            ];

            if (!query?.isExport) {
                aggregationPipeline.push(
                    {
                        $facet: {
                            data: [
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ],
                            totalCount: [
                                { $count: 'count' }
                            ]
                        }
                    }
                )
            }

            const result = await TransactionsModel.aggregate(aggregationPipeline);

            if (query?.isExport) {
                const headersMap: { [key: string]: string } = {
                    "User Name": "User Name",
                    "Transaction Amount": "Transaction Amount",
                    "Network": "Network",
                    "Currency": "Currency",
                    "Transaction Type": "Transaction Type",
                    "Transaction Remark": "Transaction Remark",
                    "Date & Time": "Date & Time",
                    "Wallet Address": "Wallet Address"
                };

                const plainRecords = result.map((txn: any) => {
                    const record: any = {
                        "User Name": txn?.user?.name || "",
                        "Transaction Amount": txn?.transactionAmount || "",
                        "Network": txn?.network || "",
                        "Currency": txn?.currency || "",
                        "Transaction Type": txn?.transactionType,
                        "Transaction Remark": txn?.remarks,
                        "Date & Time": dayjs(txn?.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                        "Wallet Address": txn?.walletDetails?.address || ""
                    };

                    txn?.walletDetails?.balances?.forEach((bal: any) => {
                        const columnKey = `${bal.currency} (${bal.network})`;

                        if (!headersMap[columnKey]) {
                            headersMap[columnKey] = columnKey;
                        }

                        record[columnKey] = bal?.availableBalance ?? 0;
                    });

                    return record;
                });

                const fileName = `transactions-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
                await generateCSV(plainRecords, headersMap, fileName, res);

                return {
                    status: true,
                    code: 200,
                    data: "CSV file downloaded successfully"
                };
            }


            const transactions = result[0]?.data || [];
            const totalResult = result[0]?.totalCount[0]?.count || 0;

            return {
                status: true,
                code: 200,
                data: {
                    transactions,
                    totalResult,
                    currentPage: page,
                    totalPages: Math.ceil(totalResult / limit)
                }
            };
        } catch (error) {
            logger.error("Error while fetching all transactions for admin:", error);
            return {
                status: false,
                code: 500,
                msg: error instanceof Error ? error.message : 'Internal server error'
            };
        }
    }


}
