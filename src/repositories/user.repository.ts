import mongoose, { Schema, SortOrder } from "mongoose";
import { IUserRepository } from "../interfaces/user.interface";
import userModel, { IUser } from "../models/user.model";
import { IUpdateUser } from "../interfaces/auth.interface";
import { IPagination } from "../interfaces/news.interface";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";
import Wallet from "../models/wallet.model";
import { ethers } from "ethers";
// import {networks} from "../networks/networks"
import Transaction from "../models/transaction.model";
import { transactionType } from "../utils/enums";

interface TokenDetails {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string | null;
}

interface NetworkDetails {
  name: string;
  currency: string;
  tokens: TokenDetails[];
}

interface NetworkResponse {
  status: boolean;
  code: number;
  data?: NetworkDetails[];
  msg?: string;
}


interface Token {
  tokenAddress: string;
  tokenSymbol: string;
}

interface Network {
  name: string;
  currency: string;
  rpc: string;
  tokens?: Token[];
}
export class UserRepository implements IUserRepository {
  async getUserById(id: Schema.Types.ObjectId): Promise<IUser | null> {
    return await userModel.findById(id).select("-refreshToken");
  }
  async deleteUserById(id: Schema.Types.ObjectId): Promise<IUser | null> {
    const user = await userModel.findByIdAndDelete(id).select("-refreshToken");
    return user;
  }

  async findAllUsers(query: IPagination): Promise<{ data: IUser[]; count: number }> {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const sort = Number(query.sort);
      const validSort: SortOrder = sort === 1 || sort === -1 ? sort : 1;
      const skip = (page - 1) * limit;
  
      const matchStage: any = { role: "user" };
  
      if (query.filter === "active") {
        matchStage.isActive = true;
      } else if (query.filter === "deactive") {
        matchStage.isActive = false;
      }
  
      if (query.search) {
        const regex = new RegExp(query.search, "i");
        matchStage.$or = [
          { name: { $regex: regex } },
          { email: { $regex: regex } }
        ];
      }
  
      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "wallets",
            localField: "_id",
            foreignField: "userId",
            as: "wallets",
            pipeline: [
              {
                $project: {
                  address: 1,
                  _id: 0
                }
              }
            ]
          }
        },
        {
          $addFields: {
            walletAddress: { $arrayElemAt: ["$wallets.address", 0] }
          }
        },
        {
          $facet: {
            data: [
              { $sort: { createdAt: validSort } },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  refreshToken: 0,
                  wallets: 0 // exclude the original wallets array
                }
              }
            ],
            totalCount: [
              { $count: "count" }
            ]
          }
        },
        {
          $project: {
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] }
          }
        }
      ];
  
      const result = await userModel.aggregate(pipeline).exec();
      const { data, count } = result[0] || { data: [], count: 0 };
  
      return { data, count };
  
    } catch (error) {
      console.error("Error in findAllUsers aggregation:", error);
      throw new Error("Failed to fetch users");
    }
  }
  

  async updateUser(
    id: Schema.Types.ObjectId,
    payload: IUpdateUser
  ): Promise<any> {
    const user = await userModel.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    const updatedUser = await userModel
      .findByIdAndUpdate(id, payload, { new: true })
      .select("-refreshToken");
    return updatedUser;
  }
  async updateStatus(id: Schema.Types.ObjectId): Promise<any> {
    const user = await userModel.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    if (user) {
      let isActive = !user?.isActive;
      const updatedUser = await userModel
        .findByIdAndUpdate(id, { isActive }, { new: true })
        .select("-refreshToken");
      return updatedUser;
    }
  }
  async getReferredUsers(referralCode: string): Promise<IUser[]> {
    return await userModel
      .find({ referredBy: referralCode })
      .select("-password -otp -refreshToken");
  }

  // async getNetwork(id: string, token?: string): Promise<NetworkResponse> {
  //   try {
  //     const networksWithTokens: NetworkDetails[] = networks.map((network) => {
  //       const networkDetails: NetworkDetails = {
  //         name: network.name,
  //         currency: network.currency,
  //         tokens: network.tokens
  //           ? network.tokens.map((t) => ({
  //               tokenName: t.tokenName,
  //               tokenSymbol: t.tokenSymbol,
  //               tokenAddress: t.tokenAddress,
  //             }))
  //           : [],
  //       };

  //       // Ensure the network's native currency is added to the token list
  //       if (
  //         network.currency &&
  //         (!network.tokens || !network.tokens.some((t) => t.tokenName === network.currency))
  //       ) {
  //         networkDetails.tokens.unshift({
  //           tokenName: network.currency,
  //           tokenSymbol: network.currency,
  //           tokenAddress: null,
  //         });
  //       }

  //       return networkDetails;
  //     });

  //     // If a token is provided, filter networks that contain the token
  //     if (token) {
  //       const matchednetworks = networksWithTokens
  //         .filter((network) =>
  //           network.tokens.some((t) => t.tokenName.toLowerCase() === token.toLowerCase())
  //         )
  //         .map((network) => ({
  //           name: network.name,
  //           currency: network.currency,
  //           tokens: network.tokens.filter((t) => t.tokenName.toLowerCase() === token.toLowerCase()),
  //         }));

  //       return {
  //         status: true,
  //         code: 200,
  //         data: matchednetworks,
  //       };
  //     }

  //     // If no token is provided, return all networks
  //     return {
  //       status: true,
  //       code: 200,
  //       data: networksWithTokens,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching networks and tokens:", error);
  //     return {
  //       status: false,
  //       code: 500,
  //       msg: "Internal Server Error",
  //     };
  //   }
  // }

  // async getTokens(id: string): Promise<any> {
  //   try {
  //     const uniqueTokens = new Map<string, { tokenSymbol: string; tokenAddress: string | null }>();

  //     networks.forEach((network) => {
  //       if (network.tokens) {
  //         network.tokens.forEach((token) => {
  //           const normalizedTokenName = token.tokenName.trim().toLowerCase();
  //           if (!uniqueTokens.has(normalizedTokenName)) {
  //             uniqueTokens.set(normalizedTokenName, {
  //               tokenSymbol: token.tokenSymbol,
  //               tokenAddress: token.tokenAddress,
  //             });
  //           }
  //         });
  //       }

  //       // Ensure the native currency is included if it's not already added
  //       if (network.currency) {
  //         const normalizedCurrencyName = network.currency.trim().toLowerCase();
  //         if (!uniqueTokens.has(normalizedCurrencyName)) {
  //           uniqueTokens.set(normalizedCurrencyName, {
  //             tokenSymbol: network.currency,
  //             tokenAddress: null,
  //           });
  //         }
  //       }
  //     });

  //     let data = Array.from(uniqueTokens.entries()).map(([tokenName, details]) => ({
  //       tokenName, // Convert back to original case if needed
  //       ...details,
  //     }));

  //     return {
  //       status: true,
  //       code: 200,
  //       data,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching unique tokens:", error);
  //     return {
  //       status: false,
  //       code: 500,
  //       msg: "Internal Server Error",
  //     };
  //   }
  // }







  // async getWalletDetails(id: string): Promise<any> {
  //   const ERC20_ABI = [
  //     "function balanceOf(address owner) view returns (uint256)",
  //     "function decimals() view returns (uint8)",
  //   ];

  //   try {
  //     const user = await userModel
  //       .findById(id)
  //       .select("-password -otp -refreshToken");

  //     if (!user) throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);

  //     let wallet = await Wallet.findOne({ userId: user?._id });

  //     if (!wallet) throw new CustomError("Wallet not found", HTTP_STATUS.NOT_FOUND);

  //     const balances = [];
  //     const transactions = await Transaction.find({ userId: user?._id });

  //     for (const network of networks) {
  //       if (network.name === "Bitcoin Testnet") {
  //         continue;
  //       }

  //       try {
  //         const provider = new ethers.JsonRpcProvider(network.rpc);

  //         const balanceWei = await provider.getBalance(wallet.address);
  //         const balanceEth = parseFloat(ethers.formatEther(balanceWei));

  //         let availableBalance = balanceEth;

  //         transactions.forEach((txn) => {
  //           if (txn.currency === network.currency) {
  //             if (
  //               txn.transactionType === transactionType.WITHDRAW ||
  //               txn.transactionType === transactionType.SPENDING
  //             ) {
  //               availableBalance -= txn.transactionAmount;
  //             } else if (txn.transactionType === transactionType.ADMIN_WITHDRAW) {
  //               availableBalance += txn.transactionAmount;
  //             }
  //           }
  //         });

  //         balances.push({
  //           balance: balanceEth,
  //           availableBalance: availableBalance,
  //           currency: network.currency,
  //           network: network.name,
  //         });

  //         if (network.tokens && network.tokens.length > 0) {
  //           for (const token of network.tokens) {
  //             try {

  //               if (!ethers.isAddress(token?.tokenAddress)) {
  //                 console.error(
  //                   `Invalid token address for ${token?.tokenSymbol}: ${token?.tokenAddress}`
  //                 );
  //                 continue;
  //               }

  //               const checksummedAddress = ethers.getAddress(token?.tokenAddress);
  //               const tokenContract = new ethers.Contract(
  //                 checksummedAddress,
  //                 ERC20_ABI,
  //                 provider
  //               );

  //               const code = await provider.getCode(checksummedAddress);
  //               if (code === "0x") {
  //                 console.error(
  //                   `No contract at address for ${token.tokenSymbol}: ${checksummedAddress}`
  //                 );
  //                 continue;
  //               }

  //               let balance = 0;
  //               try {
  //                 const rawBalance = await tokenContract.balanceOf(wallet.address);
  //                 const decimals = await tokenContract.decimals();
  //                 balance = parseFloat(ethers.formatUnits(rawBalance, decimals));
  //               } catch (err) {
  //                 console.error(
  //                   `Error fetching ${token.tokenSymbol} balance:`,
  //                   err.message
  //                 );
  //               }

  //               let tokenAvailableBalance = balance;

  //               transactions.forEach((txn) => {
  //                 if (txn.currency === token.tokenSymbol) {
  //                   if (
  //                     txn.transactionType === transactionType.WITHDRAW ||
  //                     txn.transactionType === transactionType.SPENDING
  //                   ) {
  //                     tokenAvailableBalance -= txn.transactionAmount;
  //                   } else if (
  //                     txn.transactionType === transactionType.ADMIN_WITHDRAW
  //                   ) {
  //                     tokenAvailableBalance += txn.transactionAmount;
  //                   }
  //                 }
  //               });

  //               balances.push({
  //                 balance,
  //                 availableBalance: tokenAvailableBalance,
  //                 currency: token.tokenSymbol,
  //                 network: network.name,
  //               });
  //             } catch (err) {
  //               console.error(`Error processing ${token.tokenSymbol}:`, err.message);
  //               balances.push({
  //                 balance: 0,
  //                 availableBalance: 0,
  //                 currency: token.tokenSymbol,
  //                 network: network.name,
  //               });
  //             }
  //           }
  //         }
  //       } catch (err) {
  //         console.error(`Error with ${network.name}:`, err.message);
  //       }
  //     }
  //     console.log("balances--->", balances)
  //     let retries = 3;
  //     while (retries > 0) {
  //       try {
  //         wallet.balances = balances;
  //         await wallet.save();
  //         break;
  //       } catch (err) {
  //         if (err.name === "VersionError" && retries > 0) {
  //           retries--;
  //           wallet = await Wallet.findById(wallet._id);
  //           continue;
  //         }
  //         throw err;
  //       }
  //     }

  //     const groupedBalances = {};

  //     balances.forEach(({ availableBalance, currency, network }) => {
  //       if (!groupedBalances[network]) {
  //         groupedBalances[network] = {
  //           network,
  //           native: null,
  //           tokens: [],
  //         };
  //       }

  //       const isNativeCurrency = networks.some(
  //         (net) => net.name === network && net.currency === currency
  //       );

  //       if (isNativeCurrency) {
  //         groupedBalances[network].native = { availableBalance, currency };
  //       } else {
  //         groupedBalances[network].tokens.push({ availableBalance, currency });
  //       }
  //     });

  //     return {
  //       status: true,
  //       code: 200,
  //       data: {
  //         userId: existingUser?._id,
  //         walletAddress: wallet.address,
  //         balances: Object.values(groupedBalances),
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error while fetching wallet balances:", error);
  //     return {
  //       status: false,
  //       code: 500,
  //       msg: "Internal Server Error",
  //     };
  //   }

  // }



  // async getWalletDetails(id: string): Promise<any> {
  //   const ERC20_ABI = [
  //     "function balanceOf(address owner) view returns (uint256)",
  //     "function decimals() view returns (uint8)",
  //   ];

  //   try {
  //     const user = await userModel
  //       .findById(id)
  //       .select("-password -otp -refreshToken");

  //     if (!user) throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);

  //     let wallet = await Wallet.findOne({ userId: user._id });

  //     if (!wallet) throw new CustomError("Wallet not found", HTTP_STATUS.NOT_FOUND);

  //     const balances: any[] = [];
  //     const transactions = await Transaction.find({ userId: user._id });

  //     for (const network of networks) {
  //       if (network.name === "Bitcoin Testnet") continue;

  //       try {
  //         const provider = new ethers.JsonRpcProvider(network.rpc);
  //         const balanceWei = await provider.getBalance(wallet.address);
  //         const balanceEth = parseFloat(ethers.formatEther(balanceWei));
  //         let availableBalance = balanceEth;

  //         transactions.forEach((txn) => {
  //           if (txn.currency === network.currency) {
  //             if (
  //               txn.transactionType === transactionType.WITHDRAW ||
  //               txn.transactionType === transactionType.SPENDING
  //             ) {
  //               availableBalance -= txn.transactionAmount;
  //             } else if (txn.transactionType === transactionType.ADMIN_WITHDRAW) {
  //               availableBalance += txn.transactionAmount;
  //             }
  //           }
  //         });

  //         balances.push({
  //           balance: balanceEth,
  //           availableBalance,
  //           currency: network.currency,
  //           network: network.name,
  //         });

  //         if (network.tokens && network.tokens.length > 0) {
  //           for (const token of network.tokens as Token[]) {
  //             try {
  //               if (!token?.tokenAddress || !ethers.isAddress(token.tokenAddress)) {
  //                 console.error(
  //                   `Invalid token address for ${token?.tokenSymbol}: ${token?.tokenAddress}`
  //                 );
  //                 continue;
  //               }

  //               const checksummedAddress = ethers.getAddress(token.tokenAddress);
  //               const tokenContract = new ethers.Contract(
  //                 checksummedAddress,
  //                 ERC20_ABI,
  //                 provider
  //               );

  //               const code = await provider.getCode(checksummedAddress);
  //               if (code === "0x") {
  //                 console.error(
  //                   `No contract at address for ${token.tokenSymbol}: ${checksummedAddress}`
  //                 );
  //                 continue;
  //               }

  //               let balance = 0;
  //               try {
  //                 const rawBalance = await tokenContract.balanceOf(wallet.address);
  //                 const decimals = await tokenContract.decimals();
  //                 balance = parseFloat(ethers.formatUnits(rawBalance, decimals));
  //               } catch (err) {
  //                 console.error(
  //                   `Error fetching ${token.tokenSymbol} balance:`,
  //                   (err as Error).message
  //                 );
  //               }

  //               let tokenAvailableBalance = balance;

  //               transactions.forEach((txn) => {
  //                 if (txn.currency === token.tokenSymbol) {
  //                   if (
  //                     txn.transactionType === transactionType.WITHDRAW ||
  //                     txn.transactionType === transactionType.SPENDING
  //                   ) {
  //                     tokenAvailableBalance -= txn.transactionAmount;
  //                   } else if (txn.transactionType === transactionType.ADMIN_WITHDRAW) {
  //                     tokenAvailableBalance += txn.transactionAmount;
  //                   }
  //                 }
  //               });

  //               balances.push({
  //                 balance,
  //                 availableBalance: tokenAvailableBalance,
  //                 currency: token.tokenSymbol,
  //                 network: network.name,
  //               });
  //             } catch (err) {
  //               console.error(
  //                 `Error processing ${token.tokenSymbol}:`,
  //                 (err as Error).message
  //               );
  //               balances.push({
  //                 balance: 0,
  //                 availableBalance: 0,
  //                 currency: token.tokenSymbol,
  //                 network: network.name,
  //               });
  //             }
  //           }
  //         }
  //       } catch (err) {
  //         console.error(`Error with ${network.name}:`, (err as Error).message);
  //       }
  //     }

  //     console.log("balances--->", balances);

  //     let retries = 3;
  //     while (retries > 0) {
  //       try {
  //         if (!wallet) {
  //           throw new CustomError("Wallet not found", HTTP_STATUS.NOT_FOUND);
  //         }
  //         wallet.balances = balances;
  //         await wallet.save();
  //         break;
  //       } catch (err) {
  //         if ((err as Error).name === "VersionError" && retries > 0) {
  //           retries--;
  //           wallet = await Wallet.findById(wallet?._id);
  //           continue;
  //         }
  //         throw err;
  //       }
  //     }

  //     const groupedBalances: Record<string, any> = {};

  //     balances.forEach(({ availableBalance, currency, network }) => {
  //       if (!groupedBalances[network]) {
  //         groupedBalances[network] = {
  //           network,
  //           native: null,
  //           tokens: [],
  //         };
  //       }

  //       const isNativeCurrency = networks.some(
  //         (net) => net.name === network && net.currency === currency
  //       );

  //       if (isNativeCurrency) {
  //         groupedBalances[network].native = { availableBalance, currency };
  //       } else {
  //         groupedBalances[network].tokens.push({ availableBalance, currency });
  //       }
  //     });

  //     return {
  //       status: true,
  //       code: 200,
  //       data: {
  //         userId: user._id,
  //         walletAddress: wallet?.address,
  //         balances: Object.values(groupedBalances),
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error while fetching wallet balances:", (error as Error).message);
  //     return {
  //       status: false,
  //       code: 500,
  //       msg: "Internal Server Error",
  //     };
  //   }
  // }


}
