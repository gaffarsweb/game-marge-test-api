import { Schema } from "mongoose";
import { walletRepository } from "../repositories/wallet.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";

export class WalletService {

    constructor(private walletServices: walletRepository = new walletRepository()) { }

    async checkDeposit(userId:any, networkName:string, currency:string) {
        const wallet = await this.walletServices.checkDeposit(userId, networkName, currency);
        if (!wallet) throw new CustomError("No wallet found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async getInGameWallet(userId:any) {
        const wallet = await this.walletServices.getInGameWallet(userId);
        if (!wallet) throw new CustomError("No wallet found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchWalletBalances(userId:any) {
        const wallet = await this.walletServices.fetchWalletBalances(userId);
        if (!wallet) throw new CustomError("No wallet found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchNetworks(userId:any) {
        const wallet = await this.walletServices.fetchNetworks(userId);
        if (!wallet) throw new CustomError("No wallet found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchNetworksCoins(userId:any) {
        const wallet = await this.walletServices.fetchNetworksCoins(userId);
        if (!wallet) throw new CustomError("No coins found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchNetworksByCoins(userId:any, token:string) {
        const wallet = await this.walletServices.fetchNetworksByCoins(userId, token);
        if (!wallet) throw new CustomError("No coins found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchTokenByNetwork(userId:any, token:string) {
        const wallet = await this.walletServices.fetchTokenByNetwork(userId, token);
        if (!wallet) throw new CustomError("No coins found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async fetchWalletBalanceById(userId:any) {
        const wallet = await this.walletServices.fetchWalletBalanceById(userId);
        if (!wallet) throw new CustomError("No coins found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
    async updateWalletBalance() {
        const wallet = await this.walletServices.updateWalletBalance();
        if (!wallet) throw new CustomError("No coins found", HTTP_STATUS.NOT_FOUND);
        return wallet;
    }
}

export default new WalletService()