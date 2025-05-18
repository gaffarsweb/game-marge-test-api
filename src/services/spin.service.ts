import { ISpinCombination } from "../models/spinCombination.model";
import { SpinRepository } from "../repositories/spin.repository";
import {Schema} from 'mongoose';
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class SpinService{

    constructor(private spinRepository:SpinRepository=new SpinRepository() ){}
    async spin(userId:Schema.Types.ObjectId,spinFee:number):Promise<number>{
        return this.spinRepository.spin(userId,spinFee);
    }
    async rewardUser(userId:Schema.Types.ObjectId, combination:string[],spinFee:number):Promise<any>{
        return this.spinRepository.rewardUser(userId, combination,spinFee);
    }

    async createSpinCombinations(combinations:ISpinCombination[]):Promise<ISpinCombination[]>{
        return this.spinRepository.createSpinCombinations(combinations);
    }
    async updateSpinCombination(combinationId:Schema.Types.ObjectId,combination:ISpinCombination):Promise<ISpinCombination>{
        return this.spinRepository.updateSpinCombination(combinationId,combination);
    }
    async getSpinCombinations():Promise<ISpinCombination[]>{
        const combinations=await this.spinRepository.getSpinCombinations();
        if(combinations.length===0) throw new CustomError('No spin combinations found', HTTP_STATUS.NOT_FOUND);
        return combinations;
    }
    async getSpinCombination(combinationId:Schema.Types.ObjectId):Promise<ISpinCombination>{
        return this.spinRepository.getSpinCombination(combinationId);
    }
    async getSpinHistory(query: { page?:string, limit?:string, sort?: string, search?: string, filter?: string, startDate?: string, endDate?: string }):Promise<any>{
        return this.spinRepository.getSpinHistory(query);
    }
    async deleteSpinCombination(combinationId:Schema.Types.ObjectId):Promise<ISpinCombination>{
        return this.spinRepository.deleteSpinCombination(combinationId);
    }
    async getSpinFee(userId:Schema.Types.ObjectId):Promise<{spinFee:number,spinLimit:number,remainingSpins:number}>{
        return this.spinRepository.getSpinFee(userId);
    }
}