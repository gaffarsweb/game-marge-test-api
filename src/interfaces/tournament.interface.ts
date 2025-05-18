import { Schema } from "mongoose";
import { ITournament } from "../models/tournament.model";

export interface ITournamentRepository{
    createTournament(tournament: ITournament): Promise<ITournament>;
    getTournamentById(id: Schema.Types.ObjectId): Promise<ITournament | null>;
    updateTournament(id: Schema.Types.ObjectId, tournament: Partial<ITournament>): Promise<ITournament | null>;
    deleteTournament(id: Schema.Types.ObjectId): Promise<void>;
    getAllTournamentsForApp(payload:any): Promise<{tournaments:ITournament[], total:number}>;
    getAllTournaments(payload:Partial<GetTournamentsParams>): Promise<{tournaments:ITournament[],total:number}>
}
export interface GetTournamentsParams {
    gameId: Schema.Types.ObjectId;
    status?: "upcoming" | "ongoing" | "completed";
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    filter?: string;
    startDate?: string;
    endDate?: string;
    selectedCurrency?:string;
  }