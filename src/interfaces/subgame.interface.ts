import { ISubGame } from "../models/subgame.model";
import { Schema } from "mongoose";

export  interface ISubGameRepository{
    createSubGame(payload:ISubGame):Promise<ISubGame>;
    getAllSubGames(gameId: Schema.Types.ObjectId,query:any):Promise<{ data: Partial<ISubGame>[], count: number }>;
    getSubGameById(subgameId:Schema.Types.ObjectId):Promise<ISubGame | null>;
    updateSubGame(subgameId:Schema.Types.ObjectId,payload:IUpdateSubGame):Promise<ISubGame>;
    deleteSubGame(subgameId:Schema.Types.ObjectId):Promise<void>;
}

export interface IUpdateSubGame{
    price?: number;
    entry?: number;
}
