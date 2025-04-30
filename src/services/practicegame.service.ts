import { Schema } from "mongoose";
import { practiceGameRepository } from "../repositories/practicegame.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";

export class PracticeGameServices {

    constructor(private PracticeGameServices: practiceGameRepository = new practiceGameRepository()) { }

    async getAllPracticeGameByGameId(gameId: Schema.Types.ObjectId, query: any) {
        const subGames = await this.PracticeGameServices.getAllPracticeGameByGameId(gameId, query);
        if (subGames?.data.length === 0) throw new CustomError("No subgames found", HTTP_STATUS.NOT_FOUND);
        return subGames;
    }
    async getSubGame(practiceGameId: Schema.Types.ObjectId) {
        const subGame = await this.PracticeGameServices.getSubGameById(practiceGameId);
        if (!subGame) throw new CustomError("Subgame not found", HTTP_STATUS.NOT_FOUND);
        return subGame;
    }
    async create(payload: any) {
        return await this.PracticeGameServices.createNewPracticeGame(payload);
    }
    async update(practiceGameId: Schema.Types.ObjectId, payload: any) {
        const fieldCount = Object.keys(payload).length;

        if (fieldCount === 0) {
            throw new CustomError("At least one field should be updated", HTTP_STATUS.BAD_REQUEST);
        }
        return await this.PracticeGameServices.updateSubGame(practiceGameId, payload);
    }
    async delete(practiceGameId: Schema.Types.ObjectId) {
        await this.PracticeGameServices.deleteSubGame(practiceGameId);
    }
    async playPracticeGame(practiceGameId: Schema.Types.ObjectId, userId: any) {
       return await this.PracticeGameServices.playPracticeGame(practiceGameId, userId);
    }
    async practiceGameFinished(practiceGameId: Schema.Types.ObjectId, userId: any, winingPoints:number) {
       return await this.PracticeGameServices.practiceGameFinished(practiceGameId, userId, winingPoints);
    }
}