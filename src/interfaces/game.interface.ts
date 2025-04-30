import { Schema } from "mongoose";
import { IGame } from "../models/game.model";
import { IPagination } from "./news.interface";

export interface IGamesRepository {
    getAllGames(query:IPagination): Promise<{ data: any[]; count: number }>; 
    getGameById(gameId: Schema.Types.ObjectId): Promise<IGame | null>; 
    getGameByName(name: string): Promise<IGame | null>;  
    createNewGame(game: IGame): Promise<IGame>; 
    updateGame(gameId: Schema.Types.ObjectId, game:IUpdateGame): Promise<IGame>; 
    deleteGame(gameId: Schema.Types.ObjectId): Promise<void>; 
}

export interface IUpdateGame{
    name?: string;
    imgUrl?: string;
}