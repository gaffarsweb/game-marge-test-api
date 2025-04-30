import { IBurningEvent } from "../models/burningEvent.model";
import { BurnEventRepository } from "../repositories/burnevent.repository";

export class BurnEventService{


    constructor(private burnEventRepository:BurnEventRepository=new  BurnEventRepository()){}

    async getBurnEvents():Promise<any> {
        return await this.burnEventRepository.getBurnEvents();
    }

    async getBurnEventById(id: string):Promise<IBurningEvent> {
        return await this.burnEventRepository.getBurnEventById(id);
    }

    async createBurnEvent(burnEvent: IBurningEvent): Promise<IBurningEvent> {
        return await this.burnEventRepository.createBurnEvent(burnEvent);
    }

    async updateBurnEvent(id: string, burnEvent:Partial<IBurningEvent>): Promise<IBurningEvent> {
        return await this.burnEventRepository.updateBurnEvent(id, burnEvent);
    }

    async deleteBurnEvent(id: string) {
        return await this.burnEventRepository.deleteBurnEvent(id);
    }

    async triggerBurnEvent(userId:string,eventId:string): Promise<void> {
        return await this.burnEventRepository.triggerBurnEvent(userId,eventId);
    }
    async getBurnCoinHistory(): Promise<any> {
        return await this.burnEventRepository.getBurnCoinHistory();
    }
}