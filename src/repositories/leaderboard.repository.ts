import { Schema } from "mongoose";
import PracticeGameResults from "../models/practiceGameResults.model";
import tournamentModel from "../models/tournament.model";
import tournamentParticipationModel from "../models/tournamentParticipation.model";
import gameresultModel from "../models/gameresult.model";
import gameresultScoreModel from "../models/gameresultScore.model";

export class leaderboardRepository {

    async getAllInGameCoinleaderboard(userId: Schema.Types.ObjectId, gameId: Schema.Types.ObjectId): Promise<any> {
        // 1. Find highest practice score
        const practiceHighestScore = await PracticeGameResults.findOne({ userId, gameId }).sort({ score: -1 });
        let participationHighestDetails = { score: 0 }
        // 2. Get highest tournament score for this user in tournaments of this game
        const findTournament = await tournamentModel.find({ gameId });
        for (let i = 0; i < findTournament.length; i++) {
            const tournament = findTournament[i];
            const participations = await tournamentParticipationModel.find({ tournamentId: tournament._id });

            for (let i = 0; i < participations.length; i++) {
                const participation = participations[i];
                if (participation?.userId == userId) {
                    if (participationHighestDetails && participationHighestDetails?.score < participation?.score) {
                        participationHighestDetails = participation
                    }
                }
            }
        };

        const mainGameScore = await gameresultScoreModel.findOne({
            gameId,
            userId: userId
        }).sort({ score: -1 });

        const leaderBoardAgg = await gameresultScoreModel.aggregate([
            { $sort: { score: -1 } },
            {
              $group: {
                _id: "$userId",
                topScoreDoc: { $first: "$$ROOT" }
              }
            },
            { $replaceRoot: { newRoot: "$topScoreDoc" } },
            {
              $lookup: {
                from: "users",                // collection name in MongoDB
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: "$user" // Flatten the user array to object
            },
            { $sort: { score: -1 } }
          ]);
          
          
          // // Assign ranks in JS
          // const leaderBoardWithRanks = leaderBoardAgg.map((entry, index) => ({
          //   ...entry,
          //   rank: index + 1
          // }));
          

          // const moveToFrontById = (array: any[], targetId: Schema.Types.ObjectId): any[] => {
          //   const index = array.findIndex((item) => item.userId.equals(targetId));
          //   if (index === -1) return array;
          //   return [array[index], ...array.slice(0, index), ...array.slice(index + 1)];
          // };
          const duplicateToFrontById = (array: any[], targetId: Schema.Types.ObjectId): any[] => {
            const item = array.find((item) => item.userId.equals(targetId));
            if (!item) return array;
            return [item, ...array];
          };
          
          // Add ranks
          const leaderBoardWithRanks = leaderBoardAgg.map((entry: any, index: number) => ({
            ...entry,
            rank: index + 1
          }));
          
          // Move current user to top
          const result = duplicateToFrontById(leaderBoardWithRanks, userId);
          
          
        return {
            data: {
                practiceMatch: practiceHighestScore,
                tournament: participationHighestDetails,
                oneVoneScore: mainGameScore,
                leaderBoard : result
            },
            count: {
                practice: practiceHighestScore ? 1 : 0,
                participation: participationHighestDetails ? 1 : 0,
                oneVoneScore: mainGameScore ? 1 : 0,
                leaderBoard : result.length
            }
        };
    }

}
