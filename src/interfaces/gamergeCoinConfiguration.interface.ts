import { Schema } from "mongoose";
import { IGamergeCoinConfiguration } from "../models/gamergeCoinConfiguration.model";

export interface IGamergeRepository{
    addGamergeConfiguration(gamergeCongfiguration: IGamergePayload): Promise<IGamergeCoinConfiguration>;

}

export interface IGamergePayload{
    description: string;
    network: string;
    currency: string;
    ratePerGamerge: string;
    maxGamergeCoins: number;
}

