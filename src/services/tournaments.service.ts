import { Schema } from 'mongoose';
import { TournamentRepository } from '../repositories/tournament.repositoyr';
import { ITournament } from '../models/tournament.model';
import { GetTournamentsParams } from '../interfaces/tournament.interface';
import { CustomError } from '../utils/custom-error';
import { HTTP_STATUS } from '../utils/httpStatus';


export class TournamentService {
  constructor(private tournamentRepository: TournamentRepository=new TournamentRepository()) {}

  async createTournament(tournament: ITournament): Promise<ITournament> {
    return await this.tournamentRepository.createTournament(tournament);
  }

  async getTournamentById(id: Schema.Types.ObjectId): Promise<ITournament | null> {
    const tournament= await this.tournamentRepository.getTournamentById(id);
    if(!tournament) {
      throw new CustomError("Tournament not found", HTTP_STATUS.NOT_FOUND);
    }
    return tournament;
  }

  async updateTournament(id: Schema.Types.ObjectId, tournament: Partial<ITournament>): Promise<ITournament | null> {
    return await this.tournamentRepository.updateTournament(id, tournament);
  }
    async deleteTournament(id: Schema.Types.ObjectId): Promise<void> {
        return await this.tournamentRepository.deleteTournament(id);
    }

    async getAllTournamentsForApp(payload:any): Promise<{ tournaments: ITournament[]; total: number }> {
        const result= await this.tournamentRepository.getAllTournamentsForApp(payload);
        if(result.tournaments.length === 0){
            throw new CustomError("No tournaments found",HTTP_STATUS.NOT_FOUND);
        }
        return result;
    }
    async getAllTournaments(payload:Partial<GetTournamentsParams>): Promise<{ tournaments: ITournament[]; total: number }> {
        const result= await this.tournamentRepository.getAllTournaments(payload);
        if(result.tournaments.length === 0){
            throw new CustomError("No tournaments found",HTTP_STATUS.NOT_FOUND);
        }
        return result;
    }

    async getTournamentDetailsById(tournamentId:string,userId: Schema.Types.ObjectId): Promise<ITournament[]> {
        const tournaments= await this.tournamentRepository.getTournamentDetailsById(tournamentId,userId);
        return tournaments;
    }
    async getTournamentDetailsForAdmin(tournamentId:string, query: { page?: number; limit?: number; search?: string; email?: string; sortBy?: string; order?: "asc" | "desc" }): Promise<ITournament[]> {
        const tournaments= await this.tournamentRepository.getTournamentDetailsForAdmin(tournamentId, query);
        return tournaments;
    }
    async getTournamentParticipations(tournamentId:string, query: { page?: number; limit?: number, search?: string; sort?: string }): Promise<ITournament[]> {
        const tournaments= await this.tournamentRepository.getTournamentParticipations(tournamentId, query);
        return tournaments;
    }

    async getTournamentWithoutPage(): Promise<{ tournaments: ITournament[]}> {
      const result= await this.tournamentRepository.getTournamentWithoutPage();
      if(result.tournaments.length === 0){
          throw new CustomError("No tournaments found",HTTP_STATUS.NOT_FOUND);
      }
      return result;
  }
}