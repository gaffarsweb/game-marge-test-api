import { Bot } from '../models/bot.model';
import dashboard, { Idashboard } from '../models/dashboard.model';
import gameresultModel from '../models/gameresult.model';
import userModel from '../models/user.model';
import Game from '../models/game.model';
import dayjs from 'dayjs';
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import ActiveUser from '../models/activeUsers.model';
import tournamentModel from '../models/tournament.model';
import AirdropCampaign from '../models/airdrop.model';
dayjs.extend(isSameOrBefore);

export class DashboardRepository {

  async getdashboard(): Promise<Idashboard | null> {
    const dashboardData = await dashboard.findOne();

    if (!dashboardData) {
      return null;
    }

    const dashboardObj = dashboardData.toObject();

    for (const banner of dashboardObj.banner) {
      if (banner.type && banner.link) {
        if (banner.type === 'tournament') {
          const tournament = await tournamentModel.findById(banner.link).select('name ');
          if (tournament) {
            banner.details = tournament;
          }
        } else if (banner.type === 'airdrop') {
          const airdrop = await AirdropCampaign.findById(banner.link).select('title ');
          if (airdrop) {
            banner.details = airdrop;
          }
        }
      }
    }

    return dashboardObj;
  }

  async upsertdashboard(data: Partial<Idashboard>): Promise<Idashboard> {
    return await dashboard.findOneAndUpdate({}, data, { new: true, upsert: true });
  }
  async deletedashboard(): Promise<{ deletedCount?: number }> {
    return await dashboard.deleteOne({});
  }
  async getBotStats(): Promise<any> {
    const result = await Bot.aggregate([
      {
        $group: {
          _id: null,
          totalBots: { $sum: 1 },
          currentlyPlayingBots: {
            $sum: { $cond: [{ $eq: ["$status", "playing"] }, 1, 0] }
          }
        }
      }
    ]);

    return result.length > 0 ? result[0] : { totalBots: 0, currentlyPlayingBots: 0 };
  };

  getUserStats = async () => {
    const result = await userModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalVerifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] }
          },
          totalUnverifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", false] }, 1, 0] }
          }
        }
      }
    ]);

    return result.length > 0
      ? result[0]
      : { totalUsers: 0, totalVerifiedUsers: 0, totalUnverifiedUsers: 0 };
  };

  async getMatchStats(): Promise<any> {
    const result = await gameresultModel.aggregate([
      {
        $group: {
          _id: null,
          totalMatchesPlayed: { $sum: 1 },
          totalCurrentlyPlaying: {
            $sum: { $cond: [{ $eq: ["$status", "playing"] }, 1, 0] }
          },
          totalCompletedMatches: {
            $sum: { $cond: [{ $eq: ["$status", "finished"] }, 1, 0] }
          }
        }
      }
    ]);

    return result.length
      ? result[0]
      : { totalMatchesPlayed: 0, totalCurrentlyPlaying: 0, totalCompletedMatches: 0 };
  };

  async getGameStats() {
    const result = await Game.aggregate([
      {
        $lookup: {
          from: "gameresults",
          localField: "_id",
          foreignField: "gameId",
          as: "gameResults"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          imgUrl: 1,
          totalUsersPlaying: {
            $size: {
              $filter: {
                input: "$gameResults",
                as: "result",
                cond: { $eq: ["$$result.status", "playing"] }
              }
            }
          },
          totalUsersCompleted: {
            $size: {
              $filter: {
                input: "$gameResults",
                as: "result",
                cond: { $eq: ["$$result.status", "finished"] }
              }
            }
          }
        }
      }
    ]);

    return result;
  };
  async getActiveUsersBetweenDates(startStr: string, endStr: string): Promise<any> {
    const startDate = dayjs(startStr).startOf("day");
    const endDate = dayjs(endStr).endOf("day");

    const raw = await ActiveUser.aggregate([
      {
        $match: {
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%d/%m/%Y", date: "$date" },
            },
            userId: "$userId",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          count: { $sum: 1 },
          users: { $addToSet: "$_id.userId" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const dateWise: Record<string, number> = {};
    const allUsersSet = new Set<string>();

    let current = startDate.clone();
    while (current.isSameOrBefore(endDate)) {
      const key = current.format("DD/MM/YYYY");
      dateWise[key] = 0;
      current = current.add(1, "day");
    }

    raw.forEach((entry) => {
      dateWise[entry._id] = entry.count;
      entry.users.forEach((userId: string) => allUsersSet.add(userId));
    });
    return {
      dateWise,
      total: allUsersSet.size,
    };
  }





  async getTotalUsersBetweenDates(startStr: string, endStr: string): Promise<any> {

    const startDate = dayjs(startStr).startOf("day");
    const endDate = dayjs(endStr).endOf("day");

    const raw = await userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
            },
            userId: "$_id",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          count: { $sum: 1 },
          users: { $addToSet: "$_id.userId" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    const dateWise: Record<string, number> = {};
    const allUsersSet = new Set<string>();

    let current = startDate.clone();
    while (current.isSameOrBefore(endDate)) {
      const key = current.format("DD/MM/YYYY");
      dateWise[key] = 0;
      current = current.add(1, "day");
    }

    raw.forEach((entry) => {
      dateWise[entry._id] = entry.count;
      entry.users.forEach((userId: string) => allUsersSet.add(userId));
    });


    return {
      dateWise,
      total: allUsersSet.size,
    };
  }

}


