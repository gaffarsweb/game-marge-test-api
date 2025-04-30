
import { Schema } from "mongoose";
import { IGamesRepository } from "../interfaces/game.interface";
import gameModel, { IGame } from "../models/game.model";
import GameResult from "../models/gameresult.model";
import { IPagination } from "../interfaces/news.interface";
import { SortOrder } from "mongoose";

export class GamesRepository implements IGamesRepository {
    async getAllGames(query: IPagination): Promise<{ data: any[]; count: number }> {
        const { page = 1, limit = 10, sort = 1, search = "" } = query;
        const numericSort = Number(sort);
        const validSort: SortOrder = numericSort === 1 || numericSort === -1 ? numericSort : 1;
        const skip = (page - 1) * limit;
        const sortOption: { [key: string]: SortOrder } = { createdAt: validSort };
        let filterBy: any = {}
        if(search){
            let regex = new RegExp(search, "i");
            filterBy.$or = [
                { name : { $regex: regex }}
            ]
        }
        const data = await gameModel
            .find(filterBy) 
            .sort(sortOption) 
            .skip(skip) 
            .limit(limit); 
        const count = await gameModel.countDocuments();
    
        return { data, count };
    }
    
    async getGameById(gameId: Schema.Types.ObjectId): Promise<any | null> {
        return await gameModel.findById(gameId);
    }
    async getGameByName(name: string): Promise<IGame | null> {
        return await gameModel.findOne({ name });
    }
    async createNewGame(payload: IGame): Promise<IGame> {
        return await gameModel.create(payload);
    }
    async updateGame(gameId: Schema.Types.ObjectId, payload: any): Promise<any> {
        return await gameModel.findByIdAndUpdate(gameId, payload, { new: true });
    }
    async deleteGame(gameId: Schema.Types.ObjectId): Promise<void> {
        await gameModel.findByIdAndDelete(gameId);
        return;

    }
    async getGameHistory(query:IPagination): Promise<any> {
      const { page = 1, limit = 10, sort = -1, search, filter } = query;
        const skip = (page - 1) * limit;

        let filterBy : any = {};
        if(filter){
            filterBy.isBotMatch = filter
        }
      const history = await GameResult.find(filterBy)
          .populate('gameId', 'name') 
          .populate('subGameId', 'price entry') 
          .populate('playerId', 'name avatarUrl')
          .populate('opponentId', 'name avatarUrl')
          .populate('botId', 'name avatarUrl')
          .sort({ _id: sort })
          .skip(skip)
          .limit(limit)
          .lean();
      const data = history.map((game: any) => {
          const isPlayerWinner = game.playerScore > (game.opponentScore ?? 0);
          const winnerId = isPlayerWinner ? game.playerId?._id || game.botId?._id : game.opponentId?._id || game.botId?._id;
          const winnerName = isPlayerWinner ? game.playerId?.name || game.botId?.name : game.opponentId?.name || game.botId?.name;
          const winnerAvatar = isPlayerWinner ? game.playerId?.avatarUrl || game.botId?.avatarUrl : game.opponentId?.avatarUrl || game.botId?.avatarUrl;
          const winnerScore = isPlayerWinner ? game.playerScore : game.opponentScore;
          const winnerIsBot = !!(isPlayerWinner ? game.botId && game.playerId == null : game.botId && game.opponentId == null);
  
          const loserId = isPlayerWinner ? game.opponentId?._id || game.botId?._id : game.playerId?._id || game.botId?._id;
          const loserName = isPlayerWinner ? game.opponentId?.name || game.botId?.name : game.playerId?.name || game.botId?.name;
          const loserAvatar = isPlayerWinner ? game.opponentId?.avatarUrl || game.botId?.avatarUrl : game.playerId?.avatarUrl || game.botId?.avatarUrl;
          const loserScore = isPlayerWinner ? game.opponentScore : game.playerScore;
          const loserIsBot = !!(isPlayerWinner ? game.botId && game.opponentId == null : game.botId && game.playerId == null);
  
          return {
              gameHistoryId: game._id,
              gameId: game.gameId?._id || null,  
              gameName: game.gameId?.name || "Unknown Game",
              entryAmount: game.subGameId?.entry || 0,
              winnerPrice: game.subGameId?.price || 0,
              createdAt: game.createdAt,
              isBotPlayed: game.isBotMatch,
              status:game.status || "",
              winner: {
                  id: winnerId,
                  name: winnerName || "",
                  avatarUrl: winnerAvatar || "",
                  score: winnerScore,
                  isBot: winnerIsBot, 
              },
              loser: {
                  id: loserId,
                  name: loserName || "",
                  avatarUrl: loserAvatar || "",
                  score: loserScore,
                  isBot: loserIsBot, 
              },
          };
      });
      const count = await GameResult.countDocuments();

      return {data,count};
  }
  
  
      

}