import mongoose, { Schema } from "mongoose";
import { IpracticeGameInterface } from "../interfaces/practicegame.interface";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import userModel from "../models/user.model";
import Wallet from "../models/wallet.model";
import Withdraw from "../models/withdraw.model";
import { networks } from "../networks/networks";
import { ethers } from "ethers";
import Transaction from "../models/transaction.model";
import { transactionStatus, transactionType } from "../utils/enums";
import utility from "../utils/utility";
const ERC20_ABI = [
    "function transfer(address recipient, uint256 amount) public returns (bool)",
    "function decimals() view returns (uint8)"
];
export class withdrawServices {



    async allWithdrawalRequests(userId: Schema.Types.ObjectId, query: any): Promise<any> {
        try {
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 10;
            const skip = (page - 1) * limit;
            const search = query.search?.trim();

            let sortBy: any = {};
            let filterby: any = {};
            if (query.sort === "1") {
                sortBy.createdAt = 1;
            } else if (query.sort === "-1") {
                sortBy.createdAt = -1;
            }

            if (query.filter && (query.filter === "approved" || query.filter === "rejected")) {
                filterby.status = query.filter;
            }

            const pipeline: any[] = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $lookup: {
                        from: 'wallets',
                        localField: 'user._id',
                        foreignField: 'userId',
                        as: 'wallet',
                    },
                },
                {
                    $unwind: {
                        path: '$wallet',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ];

            if (search) {
                const regex = new RegExp(search, 'i');
                pipeline.push({
                    $match: {
                        $or: [
                            { 'user.name': { $regex: regex } },
                            { 'user.email': { $regex: regex } },
                        ],
                    },
                });
            }

            if (Object.keys(filterby).length) {
                pipeline.push({ $match: filterby });
            }

            pipeline.push(
                {
                    $project: {
                        withdrawAmount: 1,
                        status: 1,
                        network: 1,
                        currency: 1,
                        withdrawToAddress: 1,
                        createdAt: 1,
                        user: {
                            _id: '$user._id',
                            name: '$user.name',
                            email: '$user.email',
                            avatarUrl: '$user.avatarUrl',
                        },
                        walletBalances: '$wallet.balances',
                    },
                },
                { $sort: sortBy },
                { $skip: skip },
                { $limit: limit }
            );

            const result = await Withdraw.aggregate(pipeline);

            const countPipeline = [...pipeline.filter(stage => ('$match' in stage || '$lookup' in stage || '$unwind' in stage))];
            countPipeline.push({ $count: 'total' });

            const countResult = await Withdraw.aggregate(countPipeline);
            const total = countResult[0]?.total || 0;

            return {
                status: true,
                code: 200,
                data: {
                    result,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error("Error while processing withdrawal:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }


    async verifyWithdrawRequest(userId: Schema.Types.ObjectId, requestId: Schema.Types.ObjectId, OTP: number): Promise<any> {
        try {
            const existingUser = await userModel.findById(userId);

            if (!existingUser) {
                return { status: false, code: 404, msg: "User not found." };
            }

            const withdrawRequest = await Withdraw.findById(requestId); // <-- fix here

            if (!withdrawRequest) {
                return { status: false, code: 404, msg: "Withdrawal request not found." };
            }

            if (withdrawRequest.otpExpiredAt && new Date(withdrawRequest.otpExpiredAt) < new Date()) {
                return { status: false, code: 400, msg: "OTP expired." };
            }
            if (withdrawRequest.OTP !== OTP) {
                return { status: false, code: 400, msg: "wrong otp." };
            }

            withdrawRequest.verifiedRequest = true;

            withdrawRequest.save()

            return {
                status: true,
                code: 200,
                data: "Withdrawal request submitted successfully.",
            };

        } catch (error) {
            console.error("Error while processing withdrawal:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }
    async resentWithdrawRequestVerification(userId: Schema.Types.ObjectId, requestId: Schema.Types.ObjectId): Promise<any> {
        try {
            const existingUser = await userModel.findById(userId);

            if (!existingUser) {
                return { status: false, code: 404, msg: "User not found." };
            }

            const withdrawRequest = await Withdraw.findById(requestId); // <-- fix here

            if (!withdrawRequest) {
                return { status: false, code: 404, msg: "Withdrawal request not found." };
            };
            if (withdrawRequest.otpExpiredAt && new Date(withdrawRequest.otpExpiredAt) > new Date()) {
                return { status: false, code: 400, msg: "OTP not expired." };
            }
            const otp = utility.generateOTP();
            const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
            if (otp) {
                withdrawRequest.otpExpiredAt = otpExpiration.toString();
                withdrawRequest.OTP = Number(otp);


                await withdrawRequest.save();
                await utility.sendEmail({ email: existingUser.email, subject: "Verify withdrawal request.", text: `Your OTP is ${otp}` });
                return {
                    status: true,
                    code: 200,
                    data: 'otp resend successfully',
                };
            }

        } catch (error) {
            console.error("Error while processing withdrawal:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }

    async sendWithdrawRequest(userId: Schema.Types.ObjectId, withdrawAmount: number, withdrawToAddress: string, currency: string, selectedNetwork: string): Promise<any> {
        try {
            const existingUser = await userModel.findById(userId);

            if (!existingUser) {
                return { status: false, code: 404, msg: "User not found." };
            }

            const wallet = await Wallet.findOne({ userId: userId });

            if (!wallet) {
                return { status: false, code: 404, msg: "User wallet not found." };
            }

            // Find the correct balance entry for the selected network and currency
            const balanceEntry = wallet.balances.find(
                (b) => b.currency === currency && b.network === selectedNetwork
            );

            if (!balanceEntry) {
                return { status: false, code: 400, msg: `No balance found for ${currency} on ${selectedNetwork}.` };
            }
            // if (currency === "USDT" && selectedNetwork === "BNB Smart Chain Testnet") {
            //     const tBNBBalance = wallet.balances.find(
            //         (b) => b.currency === "tBNB" && b.network === selectedNetwork
            //     );

            //     // If tBNB is missing or balance is 0, USDT cannot be transacted
            //     if (!tBNBBalance || tBNBBalance.balance === 0) {
            //         return { status: false, code: 400, msg: "Insufficient tBNB for gas fees!" };
            //     }
            // }

            // Check if the requested withdrawal amount is available
            if (withdrawAmount > balanceEntry.availableBalance) {
                return { status: false, code: 400, msg: "Insufficient balance for the selected network and currency." };
            }

            // Check if a pending withdrawal already exists for this user
            const existingPendingRequest = await Withdraw.findOne({
                userId: existingUser._id,
                status: "pending",
                currency,
                network: selectedNetwork,
            });

            if (existingPendingRequest) {
                return { status: false, code: 400, msg: "You already have a pending withdrawal request for this network." };
            }
            const otp = utility.generateOTP();
            const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
            if (otp) {
                const withdrawRequest = new Withdraw({
                    userId: existingUser._id,
                    withdrawToAddress,
                    status: "pending",
                    withdrawAmount,
                    network: selectedNetwork,
                    currency,
                    verifiedRequest: false,
                    otpExpiredAt: otpExpiration,
                    OTP: otp
                });

                await withdrawRequest.save();
                await utility.sendEmail({ email: existingUser.email, subject: "Verify withdrawal request.", text: `Your OTP is ${otp}` });
                return {
                    status: true,
                    code: 200,
                    data: withdrawRequest,
                };
                // return {
                //     status: true,
                //     code: 200,
                //     data: "Withdrawal request submitted successfully.",
                // };
            }


        } catch (error) {
            console.error("Error while processing withdrawal:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }


    async approveRequest(userId: Schema.Types.ObjectId, requestId: Schema.Types.ObjectId): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const withdrawRequest = await Withdraw.findById(requestId).session(session);
            if (!withdrawRequest) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 404, msg: "Withdrawal request not found." };
            }

            if (withdrawRequest.status !== "pending") {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "Only pending requests can be approved." };
            }

            const wallet = await Wallet.findOne({ userId: withdrawRequest.userId }).session(session);
            if (!wallet) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "User does not have a wallet." };
            }

            const networkInfo = networks.find(n => n.name === withdrawRequest.network);
            if (!networkInfo) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: `Invalid network: ${withdrawRequest.network}` };
            }

            const tokenDetails = await this.getTokenDetails(withdrawRequest.currency, withdrawRequest.network);
            if (!tokenDetails) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: `Currency ${withdrawRequest.currency} is not supported on ${withdrawRequest.network}.` };
            }

            const balanceEntry = wallet.balances.find(b => b.currency === withdrawRequest.currency && b.network === withdrawRequest.network);
            if (!balanceEntry) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: `No balance found for ${withdrawRequest.currency} on ${withdrawRequest.network}.` };
            }

            if (balanceEntry.availableBalance < withdrawRequest.withdrawAmount) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "Insufficient available balance." };
            }

            balanceEntry.availableBalance -= withdrawRequest.withdrawAmount;
            await wallet.save({ session });

            withdrawRequest.status = "approved";
            await withdrawRequest.save({ session });

            await Transaction.create(
                [
                    {
                        userId: withdrawRequest.userId,
                        currency: withdrawRequest.currency,
                        transactionAmount: withdrawRequest.withdrawAmount,
                        transactionType: transactionType.WITHDRAW,
                        transactionStatus: transactionStatus.SUCCESS,
                        network: withdrawRequest.network
                    },
                ],
                { session }
            );

            if (networkInfo.name === "Bitcoin Testnet") {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "Bitcoin Testnet withdrawals are not supported via this API." };
            }

            const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
            if (!adminPrivateKey) {
                throw new Error("ADMIN_WALLET_PRIVATE_KEY is not set in environment variables.");
            }

            const networkProvider = new ethers.JsonRpcProvider(networkInfo.rpc);
            const adminWalletForNetwork = new ethers.Wallet(adminPrivateKey, networkProvider);

            let tx;

            if (tokenDetails.isNative) {
                const amountInWei = ethers.parseUnits(withdrawRequest.withdrawAmount.toString(), 18);
                tx = await adminWalletForNetwork.sendTransaction({
                    to: withdrawRequest.withdrawToAddress,
                    value: amountInWei,
                });
            } else {
                const tokenContract = new ethers.Contract(tokenDetails.tokenAddress, ERC20_ABI, adminWalletForNetwork);
                const decimals = await this.getTokenDecimals(tokenDetails.tokenAddress, networkProvider);
                const amountInTokenUnits = ethers.parseUnits(withdrawRequest.withdrawAmount.toString(), decimals);
                tx = await tokenContract.transfer(withdrawRequest.withdrawToAddress, amountInTokenUnits);
            }

            await tx.wait();

            await session.commitTransaction();
            session.endSession();

            return {
                status: true,
                code: 200,
                data: `Withdrawal request approved and ${withdrawRequest.withdrawAmount} ${withdrawRequest.currency} sent successfully on ${withdrawRequest.network}.`,
            };
        } catch (error) {
            console.error("Error approving withdrawal request:", error);
            await session.abortTransaction();
            session.endSession();
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error during withdrawal approval."
            };
        }
    }

    async rejectRequest(userId: Schema.Types.ObjectId, requestId: Schema.Types.ObjectId): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const withdrawRequest = await Withdraw.findById(requestId).session(session);
            if (!withdrawRequest) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 404, msg: "Withdrawal request not found." };
            }

            if (withdrawRequest.status !== "pending") {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "Only pending requests can be rejected." };
            }

            const wallet = await Wallet.findOne({ userId: withdrawRequest.userId }).session(session);
            if (!wallet) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: "User does not have a wallet." };
            }

            const balanceEntry = wallet.balances.find(b =>
                b.currency === withdrawRequest.currency && b.network === withdrawRequest.network
            );
            if (!balanceEntry) {
                await session.abortTransaction();
                session.endSession();
                return { status: false, code: 400, msg: `No balance entry found for ${withdrawRequest.currency} on ${withdrawRequest.network}.` };
            }

            // Since it's a rejection, no balance change is required unless balance was already deducted elsewhere (which is not the case here).

            withdrawRequest.status = "rejected";
            await withdrawRequest.save({ session });

            await Transaction.create(
                [
                    {
                        userId: withdrawRequest.userId,
                        currency: withdrawRequest.currency,
                        transactionAmount: withdrawRequest.withdrawAmount,
                        transactionType: transactionType.WITHDRAW,
                        transactionStatus: transactionStatus.FAILED,
                        network: withdrawRequest.network,
                    },
                ],
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return {
                status: true,
                code: 200,
                data: `Withdrawal request rejected for ${withdrawRequest.withdrawAmount} ${withdrawRequest.currency} on ${withdrawRequest.network}.`,
            };
        } catch (error) {
            console.error("Error rejecting withdrawal request:", error);
            await session.abortTransaction();
            session.endSession();
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error during withdrawal rejection."
            };
        }
    }


    async getTokenDetails(currency: string, networkName: string): Promise<any> {
        const network = networks.find(n => n.name === networkName);

        if (network && network.currency === currency) {
            return { isNative: true, tokenAddress: null };
        }
        if (network) {

            const token = network.tokens?.find(t => t.tokenSymbol === currency);
            return token ? { isNative: false, tokenAddress: token.tokenAddress } : null;
        }
    }

    async getTokenDecimals(tokenAddress: string, provider: ethers.JsonRpcProvider): Promise<number> {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        return await tokenContract.decimals();
    }

}
