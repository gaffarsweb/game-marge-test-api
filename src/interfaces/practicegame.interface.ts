import { Schema } from "mongoose";

export  interface IpracticeGameInterface{
    createNewPracticeGame(payload:any):Promise<any>;
    getAllPracticeGameByGameId(gameId: Schema.Types.ObjectId, query:any):Promise<any>;
    getSubGameById(practiceGameId:Schema.Types.ObjectId):Promise<any>;
    updateSubGame(practiceGameId:Schema.Types.ObjectId,payload:any):Promise<any>;
    deleteSubGame(practiceGameId:Schema.Types.ObjectId):Promise<any>;
};