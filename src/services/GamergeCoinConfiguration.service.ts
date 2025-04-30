import { Schema } from "mongoose";
import { IUpdateGame } from "../interfaces/game.interface";
import { IGamergePayload } from "../interfaces/gamergeCoinConfiguration.interface";
import { GamergeCoinConfigurationRepository  } from "../repositories/gamergeCoinConfiguration.repository";


export class GamergeCoinConfigurationService {

    constructor(private gamergeRepository: GamergeCoinConfigurationRepository = new GamergeCoinConfigurationRepository()) { }

    public async addGamergeConfiguration(payload: IGamergePayload): Promise<any> {
        return await this.gamergeRepository.addGamergeConfiguration(payload);
    }
    
    public async getGamergeConfiguration(): Promise<any> {
        return await this.gamergeRepository.getGamergeConfiguration();
    }
    
    public async getUserPossibleCoinsDetails(userId: string): Promise<any> {
        return await this.gamergeRepository.getUserPossibleCoinsDetails(userId);
    }

    public async buyGamergeTokens(userId: string, payload: any): Promise<any> {
        return await this.gamergeRepository.buyGamergeTokens(userId, payload);
    }
  
}