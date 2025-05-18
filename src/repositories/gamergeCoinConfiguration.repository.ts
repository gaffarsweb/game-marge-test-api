
import mongoose, { Schema } from "mongoose";
import { IGamergeRepository } from "../interfaces/gamergeCoinConfiguration.interface";
import GamergeModel from "../models/gamergeCoinConfiguration.model";
import { IGamergePayload } from "../interfaces/gamergeCoinConfiguration.interface";
import { currency, transactionStatus, transactionType } from "../utils/enums";
import WalletModel from "../models/wallet.model";
import TransactionModel from "../models/transaction.model";
import { networks } from "../networks/networks";
import gamergeCoinConfigurationModel from "../models/gamergeCoinConfiguration.model";
import { logger } from "../utils/logger";
import networksModel from "../models/networks.model";

export class GamergeCoinConfigurationRepository implements IGamergeRepository {
    public async addGamergeConfiguration(payload: IGamergePayload): Promise<any> {
        try {

            if (payload?.network !== "BNB Smart Chain Testnet" || payload?.currency !== currency.USDT) {
                return {
                    status: false,
                    code: 400,
                    msg: `Only "BNB Smart Chain Testnet" network and "USDT" currency is allowed for now.`
                };
            }
            const networks = await networksModel.find().sort({ _id: 1 });
            const matchedNetwork = networks.find(net => net.name === payload.network);
            const matchedToken = matchedNetwork?.tokens.find(token => token.tokenSymbol === payload.currency);
            const currencyImage = matchedToken?.image;


            const configToSave = {
                ...payload,
                currencyImg: currencyImage || ""
            };

            const existingConfig = await GamergeModel.findOne().lean();

            if (existingConfig) {
                await GamergeModel.findOneAndUpdate({}, configToSave, { new: true });

                return {
                    status: true,
                    code: 200,
                    data: 'Gamerge configuration updated successfully.',
                };
            } else {

                await GamergeModel.create(configToSave);

                return {
                    status: true,
                    code: 200,
                    data: 'Gamerge configuration added successfully.',
                };
            }
        } catch (error) {
            logger.error('Error adding or updating Gamerge configuration:', error);
            return {
                status: false,
                code: 500,
                message: 'Failed to add or update Gamerge configuration',
            };
        }
    }

    async getGamergeConfiguration(): Promise<any> {
        try {
            const config = await GamergeModel.findOne().lean();

            if (!config) {
                return {
                    status: false,
                    code: 404,
                    msg: "Gamerge configuration not found.",
                };
            }

            return {
                status: true,
                code: 200,
                data: config,
            };
        } catch (error) {
            logger.error('Error fetching Gamerge configuration:', error);
            return {
                status: false,
                code: 500,
                message: 'Failed to fetch Gamerge configuration',
            };
        }
    }

    async getUserPossibleCoinsDetails(userId: string): Promise<any> {
        try {

            const userWallet = await WalletModel.findOne({ userId });

            if (!userWallet) {
                return {
                    status: false,
                    code: 404,
                    msg: "User wallet not found"
                };
            }

            const gamergeConfig = await GamergeModel.findOne().lean();

            if (!gamergeConfig) {
                return {
                    status: false,
                    code: 404,
                    msg: "Gamerge configuration not found."
                };
            }

            const findUSDBalance = userWallet.balances.find(
                (item) =>
                    item.network === gamergeConfig.network &&
                    item.currency === gamergeConfig.currency
            );

            if (!findUSDBalance) {
                return {
                    status: false,
                    code: 404,
                    msg: `No ${gamergeConfig.currency} balance found on ${gamergeConfig.network}`,
                };
            }

            const availableBalance = Number(findUSDBalance.availableBalance || 0);
            const ratePerGamerge = Number(gamergeConfig.ratePerGamerge);

            const possibleGamergeCoins = ratePerGamerge > 0
                ? Math.floor(availableBalance / ratePerGamerge)
                : 0;

            return {
                status: true,
                code: 200,
                data: {
                    availableBalance,
                    ratePerGamerge,
                    possibleGamergeCoins,
                    currency: gamergeConfig.currency,
                    network: gamergeConfig.network,
                    currencyImg: gamergeConfig.currencyImg,
                },
            };

        } catch (error) {
            logger.error('Error fetching possible Gamerge coins:', error);
            return {
                status: false,
                code: 500,
                message: 'Internal server error',
            };
        }
    }

    async buyGamergeTokens(userId: string, payload: any): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const userPossibleBuyTokens = await this.getUserPossibleCoinsDetails(userId);

            if (!userPossibleBuyTokens.status) {
                await session.abortTransaction();
                session.endSession();
                return {
                    status: false,
                    code: 400,
                    msg: userPossibleBuyTokens?.msg || "Data not found"
                };
            }

            if (payload?.gamergeTokens > userPossibleBuyTokens?.data?.possibleGamergeCoins) {
                await session.abortTransaction();
                session.endSession();
                return {
                    status: false,
                    code: 400,
                    msg: `As per your balance, you can only buy up to ${userPossibleBuyTokens?.data?.possibleGamergeCoins} Gamerge tokens`
                };
            }

            const buyingAmount = Number(payload?.gamergeTokens) * Number(userPossibleBuyTokens?.data?.ratePerGamerge);

            const userWallet = await WalletModel.findOne({ userId }).session(session);
            if (!userWallet) {
                await session.abortTransaction();
                session.endSession();
                return {
                    status: false,
                    code: 404,
                    msg: "User wallet not found"
                };
            }

            const usdtIndex = userWallet.balances.findIndex(bal =>
                bal.network === userPossibleBuyTokens.data.network &&
                bal.currency === userPossibleBuyTokens.data.currency
            );

            if (usdtIndex === -1 || userWallet.balances[usdtIndex].availableBalance < buyingAmount) {
                await session.abortTransaction();
                session.endSession();
                return {
                    status: false,
                    code: 400,
                    msg: "Insufficient USDT balance"
                };
            }

            userWallet.balances[usdtIndex].availableBalance -= buyingAmount;

            const tGMGIndex = userWallet.balances.findIndex(bal =>
                bal.network === "GMG Testnet" && bal.currency === "tGMG"
            );

            if (tGMGIndex !== -1) {
                userWallet.balances[tGMGIndex].availableBalance += payload.gamergeTokens;
            } else {
                userWallet.balances.push({
                    network: "GMG Testnet",
                    currency: "tGMG",
                    balance: 0,
                    availableBalance: payload.gamergeTokens,
                    image: "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745229330985-Group-2574.png"
                });
            }

            userWallet.markModified('balances');
            await userWallet.save({ session });
            await gamergeCoinConfigurationModel.findOneAndUpdate(
                {},
                { $inc: { totalSupply: payload.gamergeTokens } },
                { upsert: true }
            );
            await TransactionModel.create([
                {
                    userId: userId,
                    transactionAmount: buyingAmount,
                    transactionType: transactionType.BUY_GAMERGE_DEBIT,
                    transactionStatus: transactionStatus.SUCCESS,
                    network: userPossibleBuyTokens?.data?.network,
                    currency: userPossibleBuyTokens?.data?.currency,
                    remarks: "Spent USDT to buy Gamerge tokens."
                },
                {
                    userId: userId,
                    transactionAmount: payload?.gamergeTokens,
                    transactionType: transactionType.BUY_GAMERGE_CREDIT,
                    transactionStatus: transactionStatus.SUCCESS,
                    network: "GMG Testnet",
                    currency: "tGMG",
                    remarks: "Received Gamerge tokens after purchase."
                }
            ], { session, ordered: true });

            await session.commitTransaction();
            session.endSession();

            return {
                status: true,
                code: 200,
                data: "Successfully added TGMT Tokens to your account"
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            logger.error('Error processing Gamerge token purchase:', error);
            return {
                status: false,
                code: 500,
                message: 'Internal server error',
            };
        }
    }



}