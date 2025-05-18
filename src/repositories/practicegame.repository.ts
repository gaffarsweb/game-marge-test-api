import { Schema } from "mongoose";
import { IpracticeGameInterface } from "../interfaces/practicegame.interface";
import practiceGameModel from "../models/practiceGame.model";
import userModel from "../models/user.model";
import InGameCoinWallet from "../models/inGameCoinWallet.model";
import Games from "../models/game.model";
import InGameCoinTransactions from "../models/inGameCoinTransations.model";
import PracticeGameResults from "../models/practiceGameResults.model";

export class practiceGameRepository implements IpracticeGameInterface {
    async createNewPracticeGame(payload: any): Promise<any> {
        if (payload && payload.gameId) {
            const gameDetails = await Games.findById(payload.gameId);
            if (gameDetails && gameDetails.name) payload.name = gameDetails.name;
            return await practiceGameModel.create(payload);
        };
    };
    async getAllPracticeGameByGameId(gameId: Schema.Types.ObjectId, query: any): Promise<any> {

        const { page = 1, limit = 10, sort = -1, search } = query;
        const skip = (page - 1) * limit;
        let queryPaload: any = { };
        if (gameId) {
            queryPaload.gameId = gameId;
        }

        if (search) {
            queryPaload.$or = [
                { title: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(search, "i") } } // Search in description
            ];
        }
        // Fetch news with .lean() to return plain objects
        let result = await practiceGameModel.find(queryPaload)
            .sort({ _id: sort })
            .skip(skip)
            .limit(limit)
            .lean();

        const count = await practiceGameModel.countDocuments(queryPaload);

        return { data: result, count };

    }
    async getSubGameById(practiceGameId: Schema.Types.ObjectId): Promise<any> {
        return await practiceGameModel.findById(practiceGameId);
    }
    async updateSubGame(practiceGameId: Schema.Types.ObjectId, payload: any): Promise<any> {
        const updatedSubGame = await practiceGameModel.findByIdAndUpdate(practiceGameId, payload, { new: true });
        return updatedSubGame;
    }
    async deleteSubGame(practiceGameId: Schema.Types.ObjectId): Promise<void> {
        await practiceGameModel.findByIdAndDelete(practiceGameId);
        return;
    }
    async playPracticeGame(practiceGameId: Schema.Types.ObjectId, userId: any): Promise<{ status: boolean; code: number; msg: string } | void> {
        const userDetails = await userModel.findById(userId);
        const inGameWalletDetails = await InGameCoinWallet.findOne({ userId });
        const practiceGameDetails = await practiceGameModel.findById(practiceGameId);


        if (!practiceGameDetails) {
            return { status: false, code: 404, msg: 'Practice game not found' };
        }
        if (!inGameWalletDetails) {
            return { status: false, code: 404, msg: 'User wallet not found' };
        }
        if (!userDetails) {
            return { status: false, code: 404, msg: 'User not found' };
        }

        // Ensure values are numbers before comparison
        const entry = Number(practiceGameDetails.entry);
        const balance = Number(inGameWalletDetails.balance);

        if (entry > balance) {
            return { status: false, code: 400, msg: 'User does not have sufficient balance to play the game' };
        };
        userDetails.playedPracticeGame = Number(userDetails?.playedPracticeGame) + 1;
        inGameWalletDetails.balance = (balance - entry);
        await inGameWalletDetails.save();
        await userDetails.save();
        await InGameCoinTransactions.create({
             title: practiceGameDetails?.name,
             imgUrl: practiceGameDetails?.imgUrl, userId, 
             type:"DEBITED", 
             amount: entry, 
             description: `Paid ${entry} coins to play the practice game: ${practiceGameDetails?.name}`
             })

        return;

    }
    async practiceGameFinished(practiceGameId: Schema.Types.ObjectId, userId: any, winingPoints: number): Promise<{ status: boolean; code: number; msg: string } | void> {
        const userDetails = await userModel.findById(userId);
        const inGameWalletDetails = await InGameCoinWallet.findOne({ userId });
        const practiceGameDetails = await practiceGameModel.findById(practiceGameId);

        if (!practiceGameDetails) {
            return { status: false, code: 404, msg: 'Practice game not found' };
        }

        if (!inGameWalletDetails) {
            return { status: false, code: 404, msg: 'User wallet not found' };
        }
        if (!userDetails) {
            return { status: false, code: 404, msg: 'User not found' };
        }
        // Ensure values are numbers before comparison
        const balance = Number(inGameWalletDetails.balance);

        inGameWalletDetails.balance = Number(balance) + Number(winingPoints);
        await userDetails.save();
        await inGameWalletDetails.save();
        await InGameCoinTransactions.create({
             title: practiceGameDetails?.name,
             imgUrl: practiceGameDetails?.imgUrl, 
             userId, 
             type: "CREDITED", 
             amount: winingPoints, 
             description: `Received ${winingPoints} coins as a reward for winning the practice game: ${practiceGameDetails?.name}` 
            })
        await PracticeGameResults.create({ score: winingPoints, userId, gameId: practiceGameDetails?.gameId, amount: winingPoints })
        return;

    }

}