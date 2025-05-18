import { Schema } from "mongoose";
import { IpracticeGameInterface } from "../interfaces/practicegame.interface";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import userModel from "../models/user.model";
import Wallet from "../models/wallet.model";
import Transaction from "../models/transaction.model";
import { networks } from "../networks/networks";
import { ethers } from "ethers";
import fetchTokenPrices from "../utils/fetchTokenPrices";
import axios from "axios";
import Deposit from "../models/deposit.model";
import mongoose from "mongoose";
import USDRateModel from "../models/USDRate.model";
import { Types } from 'mongoose';
import { transactionStatus } from "../utils/enums";
import { logger } from "../utils/logger";
import networksModel from "../models/networks.model";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
];

interface Network {
    name: string;
    rpc: string;
    image: string;
    currency: string;
    tokens?: Array<{
        tokenAddress: string;
        tokenSymbol: string;
    }>;
}

interface TransactionType {
    WITHDRAW: string;
    SPENDING: string;
    ADMIN_WITHDRAW: string;
}

declare const transactionType: TransactionType;

type BalanceResult = {
    balance: number;
    availableBalance: number;
    currency: string;
    network: string;
    image: string;
};



interface DepositItem {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
}

interface DepositGroup {
    network: string;
    tokenSymbol: string;
    chainId: number;
    deposites: DepositItem[];
}

interface NetworkDeposit {
    network: string;
    chainId: number;
    nativeDeposits: DepositGroup | null;
    tokenDeposits: DepositGroup[];
}

interface UserDepositRecord {
    walletAddress: string;
    userId: mongoose.Types.ObjectId;
    networks: NetworkDeposit[];
}

interface DepositResponse {
    status: boolean;
    code: number;
    msg?: string;
    data?: UserDepositRecord[];
}

type GroupedBalances = Record<string, {
    network: string;
    image: string;
    native: { availableBalance: number; currency: string, image: string } | null;
    tokens: Array<{ availableBalance: number; currency: string, image: string }>;
}>;

type Balance = {
    balance: number;
    availableBalance: number;
    currency: string;
    network: string;
    image: string;
};

type GroupedNetwork = {
    network: string;
    image: string;
    tokens: Balance[];
};

function getExplorerBaseUrl(chainId: number): string {
    switch (chainId) {
        case 1: // Ethereum Mainnet
            return 'https://eth-mainnet.g.alchemy.com/v2/';
        case 97: // BSC Testnet
            return 'https://bnb-testnet.g.alchemy.com/v2/';
        case 11155111: // Ethereum Sepolia Testnet
            return 'https://eth-sepolia.g.alchemy.com/v2/';
        default:
            throw new Error(`Unsupported chainId: ${chainId}`);
    }
}


export class walletRepository {

    async getInGameWallet(userId: Schema.Types.ObjectId): Promise<any> {
        const result = await InGameCoinWallet.findOne({ userId });
        return result;
    }
    async checkDeposit(userId: Schema.Types.ObjectId, networkName: string, currency: string): Promise<any> {
        try {
            if (!Types.ObjectId.isValid(userId.toString())) {
                throw new Error('Invalid user ID format');
            }
            const networks = await networksModel.find().sort({ _id: 1 });
            const allUsers = await userModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(userId.toString())
                        // Ensure proper ObjectId conversion
                    }
                },
                {
                    $lookup: {
                        from: 'wallets',
                        let: { userId: '$_id' }, // Use variables for cleaner pipeline
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$userId', '$$userId'] }
                                }
                            },
                            {
                                $project: { // Do projection early in sub-pipeline for efficiency
                                    _id: 1,
                                    address: 1,
                                    balances: 1
                                }
                            }
                        ],
                        as: 'walletDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$walletDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userName: 1,
                        walletDetails: {
                            $ifNull: ['$walletDetails', null] // Explicit null handling
                        }
                    }
                }
            ]);

            if (!allUsers || allUsers.length === 0) {
                return { status: false, code: 404, msg: 'No users found.' };
            }

            const allWalletsDeposites: any[] = [];

            for (const user of allUsers) {
                const walletAddress: string = user?.walletDetails?.address;
                const newRecord: UserDepositRecord = { walletAddress, userId: user?._id, networks: [] };

                if (!walletAddress) {
                    logger.info(`⚠️ No wallet found for user: ${user.userName}`);
                    continue;
                }

                if (!networks || networks.length === 0) {
                    return { status: false, code: 400, msg: 'No networks available.' };
                }

                logger.info(`🔍 Fetching deposits for user: ${user.userName}, wallet: ${walletAddress}`);

                for (const network of networks) {

                    if (network.name === networkName) {
                        const networkData: NetworkDeposit = {
                            network: network.name,
                            chainId: network.chainId,
                            nativeDeposits: null,
                            tokenDeposits: [],
                        };

                        if (network.currency === currency) {
                            // Native Token Transactions
                            let success = false;
                            let attempts = 0;
                            const explorerBaseUrl = await getExplorerBaseUrl(network.chainId);
                            const data = {
                                jsonrpc: "2.0",
                                method: "eth_blockNumber",
                                params: [],
                                id: 1
                            };
                            const latestBlockUrl = `${explorerBaseUrl}${process.env.ALCHEMY_API_KEY}`;
                            const latestBlockResponse = await axios.post(`${latestBlockUrl}`, data, {
                                headers: { "Content-Type": "application/json" }
                            });
                            const latestBlockHex = latestBlockResponse.data.result; // hex format
                            const latestBlock = parseInt(latestBlockHex, 16);
                            const startBlock = latestBlock - 50;
                            const endBlock = latestBlock;
                            const maxAttempts = 5;
                            const nativeApiURL = `https://api.etherscan.io/v2/api?chainid=${network.chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;

                            while (!success && attempts < maxAttempts) {
                                try {
                                    const response = await axios.get(nativeApiURL);
                                    const data = response?.data;

                                    if (data?.status === '1' && data?.message === 'OK') {
                                        success = true;

                                        networkData.nativeDeposits = {
                                            network: network.name,
                                            tokenSymbol: network.currency,
                                            chainId: network.chainId,
                                            deposites: data.result,
                                        };

                                        for (const dItem of data.result) {
                                            const exists = await Deposit.findOne({
                                                userId: newRecord.userId,
                                                transactionHash: dItem.hash,
                                            });

                                            if (!exists) {
                                                const depositePayload = {
                                                    userId: new mongoose.Types.ObjectId(newRecord.userId),
                                                    blockNumber: parseInt(dItem.blockNumber),
                                                    timeStamp: parseInt(dItem.timeStamp),
                                                    transactionHash: dItem.hash,
                                                    from: dItem.from,
                                                    to: dItem.to,
                                                    network: network.name,
                                                    tokenSymbol: network.currency,
                                                    amount: parseFloat(ethers.formatUnits(dItem.value, 18)),
                                                };

                                                await Deposit.create(depositePayload)
                                                logger.info("📝 New native deposit found:", walletAddress, network.name, depositePayload);
                                                // Optionally save to DB here
                                                const transaction = await Transaction.create({
                                                    userId,
                                                    transactionAmount: parseFloat(ethers.formatUnits(dItem.value, 18)),
                                                    transactionType: 'deposit',
                                                    transactionStatus: transactionStatus.SUCCESS,
                                                    currency: network.currency,
                                                    network: network.name,
                                                    remarks: `Deposit amount: ${network.name}`,
                                                });
                                                return { status: true, code: 200, data: { ...depositePayload, transactionId: transaction?._id, currencyImg: network.image } };
                                            }
                                        }
                                    } else if (
                                        data?.status === '0' &&
                                        data?.message === 'NOTOK' &&
                                        data?.result.includes('Max calls per sec rate limit reached')
                                    ) {
                                        attempts++;
                                        logger.warn(`⏳ Rate limit hit. Retrying... (${attempts}/${maxAttempts})`);
                                        // await sleep(1500);
                                    } else {
                                        logger.warn(`⚠️ Unexpected response:`, walletAddress, network.name, network.chainId, data);
                                        success = true;
                                    }
                                } catch (error: any) {
                                    logger.error(`❌ Error fetching native transactions:`, error.message);
                                    attempts++;
                                    // await sleep(1000);
                                }
                            };
                        };
                        // Token Transactions
                        if (network.tokens && network.tokens.length > 0) {
                            for (const token of network.tokens) {
                                if (token.tokenSymbol === currency) {
                                    const explorerBaseUrl = await getExplorerBaseUrl(network.chainId);
                                    const data = {
                                        jsonrpc: "2.0",
                                        method: "eth_blockNumber",
                                        params: [],
                                        id: 1
                                    };
                                    const latestBlockUrl = `${explorerBaseUrl}${process.env.ALCHEMY_API_KEY}`;
                                    const latestBlockResponse = await axios.post(`${latestBlockUrl}`, data, {
                                        headers: { "Content-Type": "application/json" }
                                    });
                                    const latestBlockHex = latestBlockResponse.data.result; // hex format
                                    const latestBlock = parseInt(latestBlockHex, 16);
                                    const startBlock = latestBlock - 50;
                                    const endBlock = latestBlock;
                                    let tokenSuccess = false;
                                    let tokenAttempts = 0;
                                    const maxAttempts = 5;
                                    const tokenApiURL = `https://api.etherscan.io/v2/api?chainid=${network.chainId}&module=account&action=tokentx&contractAddress=${token.tokenAddress}&address=${walletAddress}&startblock=${'0'}&endblock=${'99999999999999999999'}&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;

                                    while (!tokenSuccess && tokenAttempts < maxAttempts) {
                                        try {
                                            const tokenResponse = await axios.get(tokenApiURL);
                                            const tokenData = tokenResponse?.data;
                                            if (tokenData?.status === '1' && tokenData?.message === 'OK') {
                                                tokenSuccess = true;
                                                networkData.tokenDeposits.push({
                                                    network: network.name,
                                                    tokenSymbol: token.tokenSymbol,
                                                    chainId: network.chainId,
                                                    deposites: tokenData.result,
                                                });
                                                for (const dItem of tokenData.result) {
                                                    const exists = await Deposit.findOne({
                                                        userId: newRecord.userId,
                                                        transactionHash: dItem.hash,
                                                    });

                                                    if (!exists) {
                                                        const depositePayload = {
                                                            userId: new mongoose.Types.ObjectId(newRecord.userId),
                                                            blockNumber: parseInt(dItem.blockNumber),
                                                            timeStamp: parseInt(dItem.timeStamp),
                                                            transactionHash: dItem.hash,
                                                            from: dItem.from,
                                                            to: dItem.to,
                                                            network: network.name,
                                                            tokenSymbol: token.tokenSymbol,
                                                            amount: parseFloat(ethers.formatUnits(dItem.value, 18)),
                                                        };

                                                        await Deposit.create(depositePayload)
                                                        logger.info("📝 New native deposit found:", walletAddress, network.name, depositePayload);
                                                        // Optionally save to DB here
                                                        const transaction = await Transaction.create({
                                                            userId,
                                                            transactionAmount: parseFloat(ethers.formatUnits(dItem.value, 18)),
                                                            transactionType: 'deposit',
                                                            transactionStatus: transactionStatus.SUCCESS,
                                                            currency: token.tokenSymbol,
                                                            network: network.name,
                                                            remarks: `Deposit amount: ${network.name}`,
                                                        });
                                                        return { status: true, code: 200, data: { ...depositePayload, transactionId: transaction?._id, currencyImg: token.image } };
                                                    }
                                                }
                                            } else if (
                                                tokenData?.status === '0' &&
                                                tokenData?.message === 'NOTOK' &&
                                                tokenData?.result.includes('Max calls per sec rate limit reached')
                                            ) {
                                                tokenAttempts++;
                                                logger.warn(`⏳ Token rate limit hit. Retrying... (${tokenAttempts}/${maxAttempts})`);
                                                // await sleep(1500);
                                            } else {
                                                logger.warn(`⚠️ Token Unexpected response:`, walletAddress, network.name, token.tokenSymbol, tokenData);
                                                tokenSuccess = true;
                                            }
                                        } catch (error: any) {
                                            logger.error(`❌ Error fetching token transactions:`, error.message);
                                            tokenAttempts++;
                                            // await sleep(1000);
                                        }
                                    }
                                }
                            }
                        }

                        newRecord.networks.push(networkData);
                    }
                }

                allWalletsDeposites.push(newRecord);
            }

            // return { status: true, code: 200, data: allUsers };
        } catch (e: any) {
            logger.error("❌ Error while getting deposits:", e);
            return {
                status: false,
                code: 500,
                msg: 'Internal Server Error',
            };
        }
    }

    async fetchTokenByNetwork(userId: Schema.Types.ObjectId, selectedNetwork: string): Promise<any> {
        try {
            const matchedTokensByNetwork: { name: string; image: string }[] = [];
            const networks = await networksModel.find().sort({ _id: 1 });

            const matchedNetworks = networks.filter((network) => network.name === selectedNetwork);

            matchedNetworks.forEach((network) => {
                // Push the native currency symbol
                if (network.currency) {
                    matchedTokensByNetwork.push({ name: network.currency, image: network?.image });
                }

                // Push all token symbols within the network
                if (Array.isArray(network.tokens)) {
                    network.tokens.forEach((token) => {
                        if (token.tokenSymbol) {
                            matchedTokensByNetwork.push({ name: token.tokenSymbol, image: token?.image });
                        }
                    });
                }
            });

            return {
                status: true,
                code: 200,
                data: matchedTokensByNetwork,
            };
        } catch (error) {
            logger.error("Error fetching networks by coin/network:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }

    async fetchNetworksByCoins(userId: Schema.Types.ObjectId, token: string): Promise<any> {
        try {
            const networks = await networksModel.find().sort({ _id: 1 });
            // Filter networks where either currency or tokenSymbol matches the given token
            const matchedNetworks = networks.filter((network) => {
                // Check native currency match
                if (network.currency === token) return true;

                // Check if any token symbol matches
                return network.tokens?.some((t) => t.tokenSymbol === token);
            });

            // Extract just the network names
            const networkNames = matchedNetworks.map((network) => { return { name: network.name, image: network?.image } });

            return {
                status: true,
                code: 200,
                data: networkNames, // e.g. ["BNB Smart Chain Mainnet", "BNB Smart Chain Testnet"]
            };
        } catch (error) {
            logger.error("Error fetching networks by coin/token:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }

    async fetchNetworksCoins(userId: Schema.Types.ObjectId): Promise<any> {
        try {
            const networks = await networksModel.find().sort({ _id: 1 });
            const allSymbols = new Map<string, { name: string; image: string }>();

            networks.forEach((network) => {
                // Add currency
                if (network.currency) {
                    allSymbols.set(network.currency, {
                        name: network.currency, // fallback if no name
                        image: network.image || '', // fallback if no image
                    });
                }

                // Add tokens' symbols
                network.tokens?.forEach((token) => {
                    if (token.tokenSymbol) {
                        allSymbols.set(token.tokenSymbol, {
                            name: token.tokenSymbol, // fallback if no name
                            image: network.image || '', // fallback if no image
                        });
                    }
                });
            });

            return {
                status: true,
                code: 200,
                data: Array.from(allSymbols.entries()).map(([symbol, info]) => ({
                    symbol,
                    ...info,
                })),
            };
        } catch (error) {
            logger.error("Error fetching token symbols and currencies:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }

    async fetchNetworks(userId: Schema.Types.ObjectId): Promise<any> {
        try {
            const networks = await networksModel.find().sort({ _id: 1 });
            const networksWithTokens = networks.map((network) => {
                // Process tokens with a fallback for missing tokenName
                const tokens = network.tokens?.map((token) => ({
                    tokenName: token.tokenSymbol,  // Use tokenSymbol as tokenName
                    tokenSymbol: token.tokenSymbol,
                    tokenAddress: token.tokenAddress,
                    image: token.image
                })) || [];

                // Check if the currency is already in the tokens
                const currencyExists = tokens.some(
                    (token) => token.tokenName === network.currency
                );

                // Add the currency as a token if it's not already present
                if (network.currency && !currencyExists) {
                    tokens.unshift({
                        tokenName: network.currency,
                        tokenSymbol: network.currency,
                        image: network.image,
                        tokenAddress: "", // Use an empty string for tokenAddress
                    });
                }

                return {
                    name: network.name,
                    currency: network.currency,
                    image: network.image,
                    tokens,
                };
            });

            return {
                status: true,
                code: 200,
                data: networksWithTokens,
            };
        } catch (error) {
            logger.error("Error fetching networks and tokens:", error);
            return {
                status: false,
                code: 500,
                msg: "Internal Server Error",
            };
        }
    }


    async fetchWalletBalances(userId: Schema.Types.ObjectId): Promise<any> {
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return { status: false, code: 404, msg: "User not found." };
        }

        let wallet = await Wallet.findOne({ userId: existingUser._id });
        if (!wallet) {
            return { status: false, code: 404, msg: "User wallet not found." };
        }

        const balances: BalanceResult[] = [];
        const transactions = await Transaction.find({ userId: existingUser._id });
        const networks = await networksModel.find().sort({ _id: 1 });

        for (const network of networks as any) {
            if (network.name === "Bitcoin Testnet") continue;

            try {
                const provider = new ethers.JsonRpcProvider(network.rpc);
                try {
                    await provider.getNetwork(); // or await provider.getBlockNumber()
                } catch (rpcErr: any) {
                    logger.error(`❌ Cannot reach RPC for ${network.name}: ${rpcErr.message}`);
                    continue; // Skip this network if it's unreachable
                }
                const balanceWei = await provider.getBalance(wallet.address);
                const balanceEth = parseFloat(ethers.formatEther(balanceWei));

                let availableBalance = 0;

                transactions.forEach((txn) => {
                    if (txn.currency === network.currency) {
                        if (['spending', 'withdraw', 'buy_gamerge_debit',].includes(txn.transactionType)) {
                            availableBalance -= txn.transactionAmount;
                        } else if (['admin_withdraw', 'reward', 'airDropClaim', 'winner_reward', 'buy_gamerge_credit', 'deposit'].includes(txn.transactionType)) {
                            availableBalance += txn.transactionAmount;
                        }
                    }
                });

                balances.push({
                    balance: balanceEth,
                    availableBalance,
                    currency: network.currency,
                    network: network.name,
                    image: network.image
                });

                if (network.tokens && network.tokens.length > 0) {
                    for (const token of network.tokens) {
                        try {
                            if (!ethers.isAddress(token.tokenAddress)) {
                                logger.error(`Invalid token address for ${token.tokenSymbol}: ${token.tokenAddress}`);
                                continue;
                            }

                            const checksummedAddress = ethers.getAddress(token.tokenAddress);
                            const tokenContract = new ethers.Contract(checksummedAddress, ERC20_ABI, provider);

                            const code = await provider.getCode(checksummedAddress);
                            if (code === "0x") {
                                logger.error(`No contract at address for ${token.tokenSymbol}: ${checksummedAddress}`);
                                continue;
                            }

                            let balance = 0;
                            try {
                                const rawBalance = await tokenContract.balanceOf(wallet.address);
                                const decimals = await tokenContract.decimals();
                                balance = parseFloat(ethers.formatUnits(rawBalance, decimals));
                            } catch (err: any) {
                                logger.error(`Error fetching ${token.tokenSymbol} balance:`, err.message);
                            }

                            let tokenAvailableBalance = 0;

                            transactions.forEach((txn) => {
                                if (txn.currency === token.tokenSymbol) {
                                    if (['spending', 'withdraw', 'buy_gamerge_debit'].includes(txn.transactionType)) {
                                        tokenAvailableBalance -= txn.transactionAmount;
                                    } else if (['admin_withdraw', 'reward', 'airDropClaim', 'winner_reward', 'buy_gamerge_credit', 'deposit'].includes(txn.transactionType)) {
                                        tokenAvailableBalance += txn.transactionAmount;
                                    }
                                }
                            });

                            balances.push({
                                balance,
                                availableBalance: tokenAvailableBalance,
                                currency: token.tokenSymbol,
                                network: network.name,
                                image: token.image
                            });
                        } catch (err: any) {
                            logger.error(`Error processing ${token.tokenSymbol}:`, err.message);
                            balances.push({
                                balance: 0,
                                availableBalance: 0,
                                currency: token.tokenSymbol,
                                network: network.name,
                                image: token.image
                            });
                        }
                    }
                }
            } catch (err: any) {
                logger.error(`Error with ${network.name}:`, err.message);
            }
        }

        let retries = 3;
        while (retries > 0) {
            try {
                wallet!.balances = balances;
                await wallet!.save();
                break;
            } catch (err: any) {
                if (err.name === "VersionError" && retries > 0) {
                    retries--;
                    wallet = await Wallet.findById(wallet!._id);
                    continue;
                }
                throw err;
            }
        }

        const groupedBalances: GroupedBalances = {};

        balances.forEach(({ availableBalance, currency, network, image }) => {
            if (!groupedBalances[network]) {
                groupedBalances[network] = {
                    network,
                    image,
                    native: null,
                    tokens: [],
                };
            }

            const isNativeCurrency = networks.some(
                (net) => net.name === network && net.currency === currency
            );

            if (isNativeCurrency) {
                groupedBalances[network].native = { availableBalance, currency, image };
            } else {
                groupedBalances[network].tokens.push({ availableBalance, currency, image });
            }
        });
        // const uniqueSymbols = [...new Set(balances.map(b => b.currency))];
        // const pricesInUSD = await fetchTokenPrices(uniqueSymbols);
        const pricesInUSD = await USDRateModel.findOne()
        let totalUSD = 0;
        balances.forEach(({ availableBalance, currency }) => {
            const price = pricesInUSD?.rates[currency] || 0;
            totalUSD += availableBalance * price;
        });
        const updated = await userModel.findByIdAndUpdate(
            userId,
            { totalUSD: Number(totalUSD.toFixed(2)) },
        );
        if (updated) {
            return {
                status: true,
                code: 200,
                data: {
                    userId: existingUser._id,
                    walletAddress: wallet!.address,
                    balances: Object.values(groupedBalances),
                    totalUSD: Number(totalUSD.toFixed(2))
                },
            };
        }
    }

    async fetchWalletBalanceById(userId: Schema.Types.ObjectId): Promise<any> {
        try {
            const networks = await networksModel.find().sort({ _id: 1 });
            const wallet = await Wallet.findOne({ userId }).lean();

            if (!wallet) {
                return {
                    status: false,
                    code: 404,
                    message: 'Wallet not found for the user',
                };
            }

            const balances: any = wallet.balances || [];

            const groupedBalances: GroupedNetwork[] = balances.reduce((acc: GroupedNetwork[], item: any) => {
                const existingGroup = acc.find((group) => group.network === item.network);
                if (existingGroup) {
                    existingGroup.tokens.push(item);
                } else {
                    acc.push({ network: item.network, image: item.image, tokens: [item] });
                }
                return acc;
            }, []);


            return {
                status: true,
                code: 200,
                data: groupedBalances,
            };
        } catch (error) {
            logger.error('Error fetching wallet:', error);
            return {
                status: false,
                code: 500,
                message: 'Internal server error',
            };
        }
    }

    async updateWalletBalance(): Promise<any> {
        try {
            logger.info(`[${new Date().toISOString()}] Starting wallet balance update job...`);

            const users = await userModel.find({ role: "user" }).lean();

            if (users.length === 0) {
                logger.warn(`[${new Date().toISOString()}] No users with role "user" found.`);
                return {
                    status: false,
                    code: 404,
                    message: 'No users with role "user" found.',
                };
            }

            let updatedCount = 0;
            let failedUsers: string[] = [];

            for (const [index, user] of users.entries()) {
                try {
                    // logger.info(`[${index + 1}/${users.length}] Updating balance for user: ${user.email || user._id}`);

                    const walletData = await this.fetchWalletBalances(user._id);
                    const totalUSDBalance = walletData?.data?.totalUSD;

                    if (typeof totalUSDBalance === 'number') {
                        // const updated = await userModel.findByIdAndUpdate(
                        //     user._id,
                        //     { totalUSD: totalUSDBalance },
                        // );

                        // if (updated) {
                        //     // logger.info(`Updated totalUSD for ${user.email || user._id}: $${totalUSDBalance}`);
                        //     updatedCount++;
                        // } else {
                        //     logger.warn(`No update applied for user ${user.email || user._id}`);
                        // }
                    } else {
                        failedUsers.push(user.email?.toString() || user._id.toString());
                        logger.warn(`Invalid totalUSD value for ${user.email || user._id}:`, totalUSDBalance);
                    }

                } catch (err: any) {
                    logger.error(`Failed to update balance for user ${user.email || user._id}:`, err.message);
                    failedUsers.push(user.email?.toString() || user._id.toString());
                }
            }

            logger.info(`[${new Date().toISOString()}] Wallet balance update job completed. ${updatedCount}/${users.length} updated.`);

            return {
                status: true,
                code: 200,
                data: {
                    totalUsers: users.length,
                    updatedUsers: updatedCount,
                    failedUsers,
                },
            };

        } catch (error: any) {
            logger.error(`[${new Date().toISOString()}]  Error in wallet update job:`, error.message);
            return {
                status: false,
                code: 500,
                message: 'Internal server error during wallet update.',
            };
        }
    }

}
