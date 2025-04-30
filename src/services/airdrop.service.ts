import { Schema } from "mongoose";
import { AirdropRepository } from "../repositories/airdrop.repository";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class AirdropService {

    constructor(private airdropRepository: AirdropRepository=new AirdropRepository()) {}
     async createAirdrop(data: any):Promise<any> {
     return await this.airdropRepository.createAirdrop(data);
  }

   async getAllAirdrops(query: any):Promise<any> {
    const airdrops= await this.airdropRepository.getAllAirdrops(query);
    if(airdrops.length===0) throw new CustomError   ("No airdrops found", HTTP_STATUS.NOT_FOUND);
    return airdrops;
  }

   async updateAirdrop(id: string, data: any):Promise<any> {
    return await this.airdropRepository.updateAirdrop(id, data);
  }

   async deleteAirdropById(id: string):Promise<any> {
    return await this.airdropRepository.delete(id);
  }

   async getActiveAirdrops():Promise<any[]> {
    const airdrops= await this.airdropRepository.getActiveAirdrops();
    if(airdrops.length===0) throw new CustomError   ("No active airdrops found", HTTP_STATUS.NOT_FOUND);
    return airdrops;
  }

   async getAirdropById(userId:Schema.Types.ObjectId,id: string):Promise<any> {
    return await this.airdropRepository.getAirdropById(userId,id);
  }

   async claimTaskReward(userId: string, campaignId: string, taskIndex: number) {
    return await this.airdropRepository.claimTaskReward(userId, campaignId, taskIndex);
  }

   async getUserCompletedTasks(userId: string, campaignId: string) {
    return await this.airdropRepository.getUserCompletedTasks(userId, campaignId);
  }

  async getAirdropWithoutPage():Promise<any> {
    const airdrops= await this.airdropRepository.getAirdropWithoutPage();
    if(airdrops.length===0) throw new CustomError   ("No airdrops found", HTTP_STATUS.NOT_FOUND);
    return airdrops;
  }
}
