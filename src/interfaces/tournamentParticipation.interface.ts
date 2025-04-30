import { ITournamentParticipation } from "../models/tournamentParticipation.model";
import {Schema} from  'mongoose';

export interface ITournamentParticipationRepository{
    getParticipationByTournamentId(tournamentId: Schema.Types.ObjectId): Promise<ITournamentParticipation[]>;
    getParticipationByUserId(userId: Schema.Types.ObjectId): Promise<ITournamentParticipation>;
    joinTournament(userId: Schema.Types.ObjectId, tournamentId: Schema.Types.ObjectId): Promise<ITournamentParticipation>;
    updateParticipation(participationId: Schema.Types.ObjectId, participationData: Partial<ITournamentParticipation>): Promise<ITournamentParticipation>;
    deleteParticipation(participationId: Schema.Types.ObjectId): Promise<void>;
    getLeaderboardByTournamentId(tournamentId: Schema.Types.ObjectId): Promise<any>;
}