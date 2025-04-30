import { IUpdateGame } from "../interfaces/game.interface";
import { IPagination } from "../interfaces/news.interface";
import { IGame } from "../models/game.model";
import { GamesRepository } from "../repositories/game.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Schema } from 'mongoose';


export class GamesService {
    constructor(private gamesRepository: GamesRepository = new GamesRepository()) { }

    async getAllGames(query: IPagination) {
        const games = await this.gamesRepository.getAllGames(query);
        if (games.data.length === 0) throw new CustomError("No games found", HTTP_STATUS.NOT_FOUND);
        return games;

    }
    async getGame(gameId: Schema.Types.ObjectId) {
        const game = await this.gamesRepository.getGameById(gameId);
        if (!game) throw new CustomError("Game not found", HTTP_STATUS.NOT_FOUND);
        return game;
    }
    async create(payload: IGame) {
        const isGameAlreadyExists = await this.gamesRepository.getGameByName(payload.name);
        if (isGameAlreadyExists) throw new CustomError("Game With Same Name already exists", HTTP_STATUS.BAD_REQUEST);
        return await this.gamesRepository.createNewGame(payload);
    }
    async update(gameId: Schema.Types.ObjectId, payload: IUpdateGame) {
        if (!payload.name && !payload.imgUrl) throw new CustomError("Please provide at least one field to update", HTTP_STATUS.BAD_REQUEST);
        const isGameAlreadyExists = await this.gamesRepository.getGameById(gameId);
        if (!isGameAlreadyExists) throw new CustomError("Game does not exist", HTTP_STATUS.BAD_REQUEST);
        return await this.gamesRepository.updateGame(gameId, payload);
    }
    async delete(gameId: Schema.Types.ObjectId) {
        return await this.gamesRepository.deleteGame(gameId);
    }
    async getGameHistory(query:IPagination): Promise<any> {
        const histories= await this.gamesRepository.getGameHistory(query);
        if(histories.data.length===0)throw new CustomError("No games history found",HTTP_STATUS.NOT_FOUND);
        return histories;
    }
}