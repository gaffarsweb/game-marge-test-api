import { Schema } from "mongoose";
import { IAuthRepository, IRegister, ISocialLogin, IUpdateUser } from "../interfaces/auth.interface";
import { IUser } from "../models/user.model";
import userModel from "../models/user.model";
import Wallet from "../models/wallet.model";
import * as multichainWallet from 'multichain-crypto-wallet';
import utility from "../utils/utility";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";
import Settings from "../models/setting.model";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import referralHistory from "../models/referralHistory.model";
import { transactionStatus, transactionType } from "../utils/enums";
import Transaction from "../models/transaction.model";
import gamergeCoinConfigurationModel from "../models/gamergeCoinConfiguration.model";

export class AuthRepository implements IAuthRepository {
  async createUser(payload: IRegister): Promise<any> {
    if (payload.referralCodeUsed) {
      const referrer = await userModel.findOne({ referralCode: payload.referralCodeUsed });
      if (!referrer) {
        throw new CustomError("Invalid referral code", HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Generate a referral code for the new user
    const referralCode = utility.generateReferralCode();
    // Create the user record
    const newUser = await userModel.create({ ...payload, referralCode });

    if (!newUser) {
      throw new CustomError("Error while creating user.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Create a wallet for the user
    const wallet = await multichainWallet.createWallet({ network: "ethereum" });
    if (!wallet || !wallet.address) {
      await userModel.findByIdAndDelete(newUser._id); // Rollback user creation if wallet fails
      throw new CustomError("Error while creating wallet for user", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    await InGameCoinWallet.create({
      userId: newUser?._id,
      balance: 100
    })
    // Store wallet details in the database
    await Wallet.create({
      userId: newUser._id,
      address: wallet.address.toLowerCase(),
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
      balances: [],
    });

    return { ...newUser, walletAddress: wallet.address };

  }
  async handleSocialLogin(payload: ISocialLogin): Promise<any> {
    const referralCode = utility.generateReferralCode();
    let newUser = await userModel.create({ ...payload, referralCode });
    // Create a wallet for the user
    const wallet = await multichainWallet.createWallet({ network: "ethereum" });
    if (!wallet || !wallet.address) {
      await userModel.findByIdAndDelete(newUser._id); // Rollback user creation if wallet fails
      throw new CustomError("Error while creating wallet for user", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    await InGameCoinWallet.create({
      userId: newUser?._id,
      balance: 100
    })
    // Store wallet details in the database
    await Wallet.create({
      userId: newUser._id,
      address: wallet.address.toLowerCase(),
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
      balances: [],
    });

    return { ...newUser, walletAddress: wallet.address };

  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await userModel.findOne({ email }).select('-refreshToken');
    return user;
  }
  async findUserById(id: Schema.Types.ObjectId): Promise<IUser | null> {
    return await userModel.findById(id);
  }
  async updateUser(id: Schema.Types.ObjectId, payload: IUpdateUser): Promise<IUser> {
    const user = await userModel.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    const updatedUser = await userModel.findByIdAndUpdate(id, payload, { new: true }).select('-refreshToken');
    if (!updatedUser) throw new Error("User does not exist");
    return updatedUser;
  }
  async deleteUserById(id: Schema.Types.ObjectId): Promise<any> {
    return await userModel.findByIdAndDelete(id);
  }
  async findUserWithFilters(filters: any): Promise<IUser | null> {
    return await userModel.findOne(filters).select('-refreshToken');
  }
  async rewardSignupBonus(userId: Schema.Types.ObjectId): Promise<void> {
    const settings = await Settings.findOne();
    if (!settings) throw new Error("Settings not found");
    let referredImg = settings.defaultImgs.find(img => img.name === "signUpBonus");
    const referredUrl: string = referredImg ? referredImg?.imgUrl : "";


    const { currency, amount, network } = settings.signup_bonus;

    await this.updateWalletBalance(userId, currency, amount, network, 'Received as a registration bonus for signing up', transactionType.reward);
    await this.updateInGameWalletBalance(userId, settings?.signup_bonus_loot_coin, 'reward', 'Received as a registration bonus for signing up', 'signUp bonus', referredUrl);

  };
  async createReferralHistory(newUserId: Schema.Types.ObjectId, referralCode: string): Promise<void> {
    const referrer = await userModel.findOne({ referralCode });
    if (!referrer) throw new CustomError(`Referral code ${referralCode} not found`, HTTP_STATUS.BAD_REQUEST);
    const settings = await Settings.findOne();
    if (!settings) throw new Error("Settings not found");
    const { currency, amount } = settings.referral_bonus;
    const referrerId = referrer._id;
    await referralHistory.create({ referredBy: referrerId, referredTo: newUserId, currency, balance: amount })
  }
  async rewardReferrer(referralCode: string): Promise<void> {
    const referrer = await userModel.findOne({ referralCode });
    if (!referrer) throw new CustomError(`Referral code ${referralCode} not found`, HTTP_STATUS.BAD_REQUEST);
    const settings = await Settings.findOne();
    if (!settings) throw new Error("Settings not found");
    let referredImg = settings.defaultImgs.find(img => img.name === "referred");
    const referredUrl: string = referredImg ? referredImg?.imgUrl : "";

    const { currency, amount, network } = settings.referral_bonus;
    const referrerId = referrer._id;
    await this.updateWalletBalance(referrerId, currency, amount, network, 'Received a reward for referring a friend', transactionType.reward);
    await this.updateInGameWalletBalance(referrerId, settings?.referral_bonus_loot_coin, 'reward', 'Received a reward for referring a friend', 'referred friend', referredUrl);
  }
  async updateInGameWalletBalance(userId: Schema.Types.ObjectId, amount: number, type: string, description: string, title: string, imgUrl: string): Promise<void> {
    let wallet = await InGameCoinWallet.findOne({ userId });

    if (!wallet) {
      throw new Error("Wallet not found")
    }

    if (amount > 0) {
      wallet.balance = Number(wallet.balance) + amount;
      await wallet.save();
      await InGameCoinTransactions.create({ userId, type, amount: amount, description, title, imgUrl })
    }


  };
  async updateWalletBalance(userId: Schema.Types.ObjectId, currency: string, amount: number, network: string, des: string, transactionType: string): Promise<void> {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      throw new Error("Wallet not found")
    }

    const balanceEntry = wallet.balances.find(b => b.currency === currency && b?.network === network);
    if (balanceEntry) {
      balanceEntry.availableBalance += amount;
    } else {
      wallet.balances.push({ currency, balance: 0, availableBalance: amount, network });
    }

    await wallet.save();
    await Transaction.create({
      userId,
      transactionAmount: amount,
      transactionType: transactionType,
      transactionStatus: transactionStatus.SUCCESS,
      currency: currency,
      network: network,
      remarks: des
    });
    if (currency === 'tGMG') {
      await gamergeCoinConfigurationModel.findOneAndUpdate(
        {},
        { $inc: { totalSupply: amount } },
        { upsert: true }
      );
    }
  };

}