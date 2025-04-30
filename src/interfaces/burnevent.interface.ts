import { IBurningEvent } from "../models/burningEvent.model";

export interface IBurnEventRepository {
    getBurnEvents(): Promise<any>;
    getBurnEventById(id: string): Promise<any>;
    createBurnEvent(burnEvent: any): Promise<IBurningEvent>;
    updateBurnEvent(id: string, burnEvent: any): Promise<IBurningEvent>;
    deleteBurnEvent(id: string): Promise<IBurningEvent>;
}