import Wallet from "../models/wallet.model";
import Transaction from "../models/transaction.model";
import { Types } from "mongoose";
import { transactionStatus, transactionType } from "./enums";
import { logger } from "./logger";

export const creditRewardToUser = async (
  userId: Types.ObjectId,
  amount: number,
  currency: string,
  network:string,
  remark: string
) => {
  // Update user's balance in Wallet
  await Wallet.updateOne(
    { userId, "balances.currency": currency, "balances.network":network },
    { $inc: { "balances.$.availableBalance": amount } }
  );
 logger.info("Balance updated in wallet for userId:",userId,"currency:",currency,"amount:",amount);
  // Log transaction
  await Transaction.create({
    userId,
    transactionAmount: amount,
    transactionType: transactionType.DEPOSIT,
    transactionStatus: transactionStatus.SUCCESS,
    currency,
    network,
    remarks: remark
  });
};
