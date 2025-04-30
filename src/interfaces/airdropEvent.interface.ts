import { IAirdropEvent } from "../models/airdropEvent.model";
import {Schema} from "mongoose";
export interface IAirdropEventRepository {
    createAirdropEvent(data: IAirdropEvent): Promise<IAirdropEvent>;
    getActiveAirdrop(airdropId:Schema.Types.ObjectId): Promise<IAirdropEvent | null>;
    getAirdropEventById(id: string): Promise<IAirdropEvent | null>;
    updateAirdropEvent(id: string, data: Partial<IAirdropEvent>): Promise<IAirdropEvent | null>;
    deleteAirdropEvent(id: string): Promise<void>;
}

export interface GetClaimsParams {
    airdropId: Schema.Types.ObjectId;
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }