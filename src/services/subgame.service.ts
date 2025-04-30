import { Schema } from "mongoose";
import { SubGameRepository } from "../repositories/subgame.repository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { CustomError } from "../utils/custom-error";
import { ISubGame } from "../models/subgame.model";
import { IUpdateSubGame } from "../interfaces/subgame.interface";

export class SubGameService{
    
    constructor(private subGameService: SubGameRepository=new SubGameRepository()){}

    async getAllSubGames(gameId: any,query:any){
        const subGames= await this.subGameService.getAllSubGames(gameId,query);
        if(subGames?.data.length===0) throw new CustomError("No subgames found",HTTP_STATUS.NOT_FOUND);
        return subGames;
    }
    async getAllSubGamesForApp(query:any){
        const subGames= await this.subGameService.getAllSubGamesForApp(query);
        if(subGames?.data.length===0) throw new CustomError("No subgames found",HTTP_STATUS.NOT_FOUND);
        return subGames;
    }
    async getSubGame(subGameId: Schema.Types.ObjectId){
        const subGame= await this.subGameService.getSubGameById(subGameId);
        if(!subGame)throw new CustomError("Subgame not found",HTTP_STATUS.NOT_FOUND);
        return subGame;
    }
    async create( payload: ISubGame){
        return await this.subGameService.createSubGame(payload);
    }
    async update(subGameId: Schema.Types.ObjectId, payload: IUpdateSubGame){
        if(!payload.price &&!payload.entry) throw new CustomError("At least one field should be updated",HTTP_STATUS.BAD_REQUEST);
        return await this.subGameService.updateSubGame(subGameId, payload);
    }
    async delete(subGameId: Schema.Types.ObjectId){
        await this.subGameService.deleteSubGame(subGameId);
    }
}