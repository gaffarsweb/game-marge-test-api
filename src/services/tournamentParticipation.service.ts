import { Schema } from "mongoose";
import { TournamentParticipationRepository } from "../repositories/tournamentParticipation.repository";
import { ITournamentParticipation } from "../models/tournamentParticipation.model";

export class TournamentParticipationService{

    constructor(private tournamentParticipationRepository:TournamentParticipationRepository=new TournamentParticipationRepository()){}

    async joinTournament(userId: Schema.Types.ObjectId, tournamentId: Schema.Types.ObjectId):Promise<any>{
        return await this.tournamentParticipationRepository.joinTournament(userId,tournamentId);
    }  
    async getParticipationByTournamentId(tournamentId: Schema.Types.ObjectId): Promise<any>{
        return await this.tournamentParticipationRepository.getParticipationByTournamentId(tournamentId);
    }
    async getParticipationByUserId(userId: Schema.Types.ObjectId): Promise<any>{
        return await this.tournamentParticipationRepository.getParticipationByUserId(userId);
    }
    async updateParticipation(participationId: Schema.Types.ObjectId, participationData: Partial<ITournamentParticipation>): Promise<ITournamentParticipation>{
        return await this.tournamentParticipationRepository.updateParticipation(participationId, participationData);
    }
}