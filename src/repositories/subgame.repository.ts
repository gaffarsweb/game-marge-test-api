import mongoose, { Schema } from "mongoose";
import { networks } from "../networks/networks";
import { ISubGameRepository, IUpdateSubGame } from "../interfaces/subgame.interface";
import subgameModel, { ISubGame } from "../models/subgame.model";

export class SubGameRepository implements ISubGameRepository {
  async createSubGame(payload: ISubGame): Promise<ISubGame> {
    return await subgameModel.create(payload);
  }
  async getAllSubGames(
    gameId: any,
    query: any
  ): Promise<{ data: ISubGame[]; count: number }> {

    const currencyImages: Record<string, string> = {};
    networks.forEach((network) => {
      currencyImages[network.currency] = network.image;
      if (network.tokens.length !== 0) currencyImages[network.tokens[0].tokenSymbol] = network.tokens[0].image;
    });
    let data;
    let count;
    if (gameId !== 'null') {
      data = await subgameModel.find({ gameId: new mongoose.Types.ObjectId(gameId), ...query }).lean();
      count = await subgameModel.countDocuments({ gameId, ...query });
    } else {
      console.log('gameId', gameId)
      data = await subgameModel.find({ ...query }).lean();
      count = await subgameModel.countDocuments({ ...query });
    }

    const subgames = data.map((subgame) => ({
      ...subgame,
      currencyImage: currencyImages[subgame.currency] || ""
    }));


    return { data: subgames, count };
  }
  async getAllSubGamesForApp(query: any): Promise<{ data:any, count: number }> {
    const currencyImages: Record<string, string> = {};
    networks.forEach((network) => {
      currencyImages[network.currency] = network.image;
      if (network.tokens.length !== 0) currencyImages[network.tokens[0].tokenSymbol] = network.tokens[0].image;
    });
    const [data,total]=await Promise.all([
      subgameModel.find(query).lean(),
      subgameModel.countDocuments(query)
    ])

    const subgames = data.map((subgame:ISubGame) => ({
      ...subgame,
      currencyImage: currencyImages[subgame.currency] || ""
    }));


    return { data: subgames, count:total };
  }


  async getSubGameById(subgameId: Schema.Types.ObjectId): Promise<ISubGame | null> {
    return await subgameModel.findById(subgameId);
  }
  async updateSubGame(subgameId: Schema.Types.ObjectId, payload: IUpdateSubGame): Promise<any> {
    const updatedSubGame = await subgameModel.findByIdAndUpdate(subgameId, payload, { new: true });
    return updatedSubGame;
  }
  async deleteSubGame(subgameId: Schema.Types.ObjectId): Promise<void> {
    await subgameModel.findByIdAndDelete(subgameId);
    return;
  }
}