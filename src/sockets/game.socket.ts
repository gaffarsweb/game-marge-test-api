import { Server, Socket } from "socket.io";
import { Matchmaking } from "../models/matchmaking.model";
import GameResult from "../models/gameresult.model";
import { Bot, IBot } from '../models/bot.model';
import userModel, { IUser } from "../models/user.model";
import mongoose from "mongoose";
import subgameModel, { ISubGame } from "../models/subgame.model";
import ActiveUser from "../models/activeUsers.model";
import dayjs from "dayjs";
import gameresultScoreModel from "../models/gameresultScore.model";
import BurningTransaction from '../models/burnCoinTransaction.model'
import { logger } from "../utils/logger";
import Wallet from "../models/wallet.model";
import Transaction from "../models/transaction.model";
import { transactionStatus, transactionType } from "../utils/enums";
import Settings, { ISettings } from "../models/setting.model";
import burningCoinsModel from "../models/burningCoins.model";


interface IOpponent {
  socketId: string;
  userId: string;
  firstName: string;
  lastName:string;
  avatarUrl: string;
}

interface JoinGame {
  userId: string;
  gameId: string;
  subGameId: string;
}

interface BurnTransactionData {
  userId: string;
  amountBurned: number;
  currency: string;
  network: string;
  subGameId: string;
  gameId: string;
  gameResultId: string;

}
const activeTimeouts = new Map<string, NodeJS.Timeout>();
const activeUsersMap = new Map<string, string>(); // userId -> socket.id

export function getReceiverSocketId(userId: string): string | undefined {
  return activeUsersMap.get(userId);
}
export async function setupGameSockets(io: Server, socket: Socket) {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    activeUsersMap.set(userId, socket.id);
    io.emit("activeUsers", { count: activeUsersMap.size });
   await trackDailyActiveUser(userId).catch(console.error);
  }

  socket.join("onlineUsers");

  socket.on("joinMatchGame", async (data) => {
    // logger.info(`User with Id: ${data.userId} is looking for a match`);
    await matchGame(io, socket, data);
  });

  socket.on("gameFinished", async (data) => {
    // logger.info(`User ${data.userId} finished the game`);
    await handleGameFinish(io, socket, data);
  });

  socket.on("exitGame", async (data) => {
    await removePlayer(socket.id);
    // logger.info(`User ${data.userId} exited the game`);
    io.to(socket.id).emit("opponentLeft", "Opponent left the game");
  });

  socket.on("getActiveUsers", async () => {
    io.emit("activeUsers", { count: activeUsersMap.size });
  })

  socket.on("disconnect", async () => {
    // logger.info(`User disconnected: ${socket.id}`);
    const disconnectedUser = [...activeUsersMap.entries()].find(([_, sid]) => sid === socket.id);
    if (disconnectedUser) {
      activeUsersMap.delete(disconnectedUser[0]);
      io.emit("activeUsers", { count: activeUsersMap.size });
      // logger.info(`User ${disconnectedUser[0]} removed from active users`);
    }
    await removePlayer(socket.id);
  });
}


async function matchGame(io: Server, socket: Socket, playerData: JoinGame) {
  try {
    const { userId, gameId, subGameId } = playerData;

    const subgame = await subgameModel.findById(subGameId);
    if (!subgame) {
      return socket.emit("matchError", "Subgame not found");
    }

    const entryFee = subgame.entry;
    const currency = subgame.currency;
    const network = subgame.network || "BNB Smart Chain Testnet";

    // Check current user wallet
    const currentUserWallet = await Wallet.findOne({ userId });
    if (!currentUserWallet) return socket.emit("matchError", "User wallet not found");

    const currentUserBalance = currentUserWallet.balances.find(
      (b) => b.currency === currency && b.network === network
    );
    if (!currentUserBalance || currentUserBalance.availableBalance < entryFee) {
      socket.emit("hasBalance",{hasBalance:false});
      return socket.emit("matchError", "Insufficient balance");
    }
    socket.emit("hasBalance",{hasBalance:true});
    // Try to find opponent
    const opponent = await findMatchWithOpponent(playerData) as IOpponent | null;
    if (opponent) {
      const opponentSocketId = opponent.socketId;
      const opponentId = opponent.userId;

      // Stop opponent timeout
      if (activeTimeouts.has(opponentId)) {
        clearTimeout(activeTimeouts.get(opponentId));
        activeTimeouts.delete(opponentId);
      }

      const opponentWallet = await Wallet.findOne({ userId: opponentId });
      if (!opponentWallet) {
        io.to(opponentSocketId).emit("matchError", "Your wallet not found");
        return socket.emit("matchError", "Match failed, opponent has no wallet");
      }

      const opponentBalance = opponentWallet.balances.find(
        (b) => b.currency === currency && b.network === network
      );

      if (!opponentBalance || opponentBalance.availableBalance < entryFee) {
        io.to(opponentSocketId).emit("matchError", "Insufficient balance");
        return socket.emit("matchError", "Match failed, opponent has insufficient balance");
      }

      // Deduct balance from both players
      currentUserBalance.availableBalance -= entryFee;
      opponentBalance.availableBalance -= entryFee;

      await Promise.all([currentUserWallet.save(), opponentWallet.save()]);

      const roomId = `match_${gameId}_${userId}_${opponentId}_${Date.now()}`;

      const currentUser = await userModel.findById(userId);

      // Notify both users
      io.to(opponentSocketId).emit("opponentFound", {
        opponent_id: userId,
        opponent_firstName: currentUser?.firstName || "Unknown",
        opponent_lastName: currentUser?.firstName || "",
        opponent_avatarUrl: currentUser?.avatarUrl,
        status: "matched",
        gameId,
        subGameId,
        roomId,
        isBot: false,
      });

      io.to(socket.id).emit("opponentFound", {
        opponent_id: opponentId,
        opponent_firstName: opponent?.firstName,
        opponent_lastName: opponent?.lastName || "",
        opponent_avatarUrl: opponent.avatarUrl,
        status: "matched",
        gameId,
        subGameId,
        roomId,
        isBot: false,
      });

      await Matchmaking.deleteMany({ userId: { $in: [userId, opponentId] } });
      await subgameModel.findByIdAndUpdate(subGameId, { $inc: { activeUsers: 2 } })
      // Join Room
      socket.join(roomId);
      io.sockets.sockets.get(opponentSocketId)?.join(roomId);

      // Save Game Result
      await GameResult.create({
        roomId,
        gameId,
        subGameId,
        playerId: userId,
        opponentId,
        isBotMatch: false,
        opponentType: "user",
        createdAt: new Date(),
      });

      // logger.info(`Match started between ${userId} and ${opponentId} in room ${roomId}`);
    } else {
      // Add to matchmaking
      await Matchmaking.create({
        userId,
        gameId,
        subGameId,
        socketId: socket.id,
        status: "waiting",
        createdAt: new Date(),
      });

      // logger.info(`User with ID: ${userId} added to matchmaking queue`);
      io.to(socket.id).emit("searchingOpponent", "Searching for an opponent...");
      const botWaitingTime = ((await Settings.findOne({}, { botWaitingTime: 1 }))?.botWaitingTime || 10) * 1000;

      const timeoutId = setTimeout(async () => {
        const stillWaiting = await Matchmaking.findOne({
          userId,
          gameId,
          subGameId,
          status: "waiting",
        });

        if (stillWaiting) {
          // logger.info(`No opponent found for user with ID: ${userId}, matching with bot...`);
          await matchWithBot(io, socket, playerData, currentUserWallet, subgame);
        }

        activeTimeouts.delete(userId);
      }, botWaitingTime);

      activeTimeouts.set(userId, timeoutId);
    }
  } catch (error: any) {
    logger.error(`Error in matchGame: ${error}`);
    socket.emit("matchError", "Something went wrong while finding match");
  }
}

async function matchWithBot(io: Server, socket: Socket, playerData: any, userWallet: any, subgame: any) {
  try {
    const { userId, gameId, subGameId } = playerData;

    // Fetch a random bot
    const bots = await Bot.find();
    if (bots.length === 0) {
      logger.info("No bots available.");
      io.to(socket.id).emit("error", "No bots available to play.");
      return;
    }

    const bot = bots[Math.floor(Math.random() * bots.length)];


    const roomId = `match_${gameId}_${userId}_bot_${bot._id}_${Date.now()}`;



    const balanceEntry = userWallet.balances.find(
      (b: any) =>
        b.currency === subgame.currency &&
        b.network === subgame.network
    );

    if (!balanceEntry || balanceEntry.availableBalance < subgame.entry) {
      io.to(socket.id).emit("error", "Insufficient balance to join the match.");
      return;
    }

    //  Deduct entry fee
    balanceEntry.availableBalance -= subgame.entry;
    await userWallet.save();

    // Create transaction
    await Transaction.create({
      userId,
      transactionAmount: subgame.entry,
      transactionType: transactionType.SPENDING,
      transactionStatus: transactionStatus.SUCCESS,
      currency: subgame.currency,
      network: subgame.network,
      remarks: `Bot match entry for subgame ${subgame.title || subgame._id}`,
    });

    // Informing frontend about opponent
    io.to(socket.id).emit("opponentFound", {
      opponent_id: bot._id,
      opponent_firstName: bot.name,
      opponent_lastName:"",
      opponent_avatarUrl: bot.avatarUrl || "",
      status: "matched",
      gameId,
      subGameId,
      roomId,
      isBot: true,
    });

    socket.join(roomId);

    //  Remove from queue
    await Matchmaking.deleteMany({ userId });
    await subgameModel.findByIdAndUpdate(subGameId, { $inc: { activeUsers: 2 } })
    //  Save game result
    await GameResult.create({
      roomId,
      gameId,
      subGameId,
      playerId: userId,
      botId: bot._id,
      isBotMatch: true,
      opponentType: "bot",
      createdAt: new Date(),
    });

    //  Update bot status
    bot.status = "playing";
    await bot.save();

    logger.info(`Match started between User ${userId} and Bot ${bot.name} in room ${roomId}`);
  } catch (error: any) {
    logger.error(`Error in matchWithBot: ${error.message}`);
    io.to(socket.id).emit("error", "Something went wrong. Please try again later.");
  }
}


async function  handleGameFinish(io: Server, socket: Socket, data: {
  roomId: string;
  userId: string;
  score: number;
}) {
  try {
    const { roomId, userId, score } = data;

    const game = await GameResult.findOne({ roomId });
    if (!game) return io.to(socket.id).emit("error", "Game not found");
    const settings=await  Settings.findOne();
    if (game.playerId.toString() === userId) {
      game.playerScore = score;
      await game.save();
      await gameresultScoreModel.create({ userId, gameId: game.gameId, subGameId: game.subGameId, score, status: "finished" });

      if (game.isBotMatch) {
        const bot = await Bot.findById(game.botId);
        if (bot) {
          bot.status = 'idle';
          await bot.save();
          let botResultWaitingTime=(settings?.botResultWaitingTime || 10)*1000;
          io.to(socket.id).emit("waitingOpponent", "Waiting for opponent to finish");
          return setTimeout(() => simulateBotPlay(io, roomId, userId, bot, score), botResultWaitingTime);
        }
        return;
      }
    }

    if (game.opponentId?.toString() === userId) {
      game.opponentScore = score;
      await game.save();
      await gameresultScoreModel.create({ userId, gameId: game.gameId, subGameId: game.subGameId, score, status: "finished" });
    }

    // Wait until both players finish
    if (game.playerScore === 0 || game.opponentScore === 0) {
      return io.to(socket.id).emit("waitingOpponent", "Waiting for opponent to finish");
    }

    game.status = "finished";
    await game.save();
    await subgameModel.updateOne({ _id: game.subGameId._id, activeUsers: { $gte: 2 } }, { $inc: { activeUsers: -2 } })

    if (game.isBotMatch) return;

    const [populatedGame] = await Promise.all([
      GameResult.findById(game._id)
        .populate<{ playerId: IUser }>("playerId", "firstName lastName avatarUrl referredBy")
        .populate<{ opponentId: IUser }>("opponentId", "firstName lastName avatarUrl referredBy")
        .populate<{ subGameId: ISubGame }>("subGameId", "entry price currency network"),
    ]);

    if (!populatedGame || !settings) return io.to(socket.id).emit("error", "Unable to resolve game or settings");

    const subGame = populatedGame.subGameId as ISubGame;
    const player = populatedGame.playerId as IUser;
    const opponent = populatedGame.opponentId as IUser;

    let winner: any = null;
    let loser: any = null;
    let winnerUserId: string | null = null;

    if ((game.playerScore ?? 0) > (game.opponentScore ?? 0)) {
      winnerUserId = player._id.toString();
      winner = { id: player._id, firstName: (player.firstName || "Unknwon"),lastName:player.lastName, avatarUrl: player.avatarUrl, score: game.playerScore };
      loser = { id: opponent._id, firstName:( opponent.firstName || "Unknown"),lastName:opponent.lastName, avatarUrl: opponent.avatarUrl, score: game.opponentScore };
    } else if ((game.playerScore ?? 0) < (game.opponentScore ?? 0)) {
      winnerUserId = opponent._id.toString();
      winner = { id: opponent._id, firstName: (opponent.firstName || "Unknown"),lastName:opponent.lastName, avatarUrl: opponent.avatarUrl, score: game.opponentScore };
      loser = { id: player._id, firtName: (player.firstName || "Unknown"),lastName:player.lastName, avatarUrl: player.avatarUrl, score: game.playerScore };
    }

    // If it's a draw, no payout
    if (!winnerUserId) {
      return io.to(roomId).emit("gameResult", { winner: null, loser: null });
    }
    const {
      winningPool,
      totalDeduction,
      burnAmount,
      referralEach,
      netToWinner,
    } = calculateGameDeductions(subGame.price, (settings?.win_deduction_percentage || 10));
    const companyId = "67f0c16d590de0594bc56742";

    await creditToWallet(winnerUserId, netToWinner, subGame.currency, subGame.network, `Winning reward from game ${roomId}`);
    const burnCoinsSetting = {
      currency: settings?.win_coin_percentage_burn.currency || "GMG",
      percentage: settings?.win_coin_percentage_burn.parentage || 5,
      network: settings?.win_coin_percentage_burn.network || "GMG Testnet"

    }
    const burnTransactionData: BurnTransactionData = {
      userId: winnerUserId,
      gameId: (game.gameId as any) as string,
      subGameId: (game.subGameId as any) as string,
      gameResultId: (game._id as any) as string,
      currency: subGame.currency,
      network: subGame.network,
      amountBurned: burnAmount

    }
    await handleBurnOrCompanyShare(burnCoinsSetting, burnAmount, subGame.currency, subGame.network, companyId, burnTransactionData);
    await handleReferralDistribution(player.referredBy, referralEach, subGame.currency, subGame.network, companyId);
    await handleReferralDistribution(opponent.referredBy, referralEach, subGame.currency, subGame.network, companyId);


    // Emit final result
    io.to(roomId).emit("gameResult", {
      winner: { ...winner, earn: netToWinner,loseAmount:0 },
      loser: { ...loser, earn: 0, loseAmount: subGame.entry }
    });

  } catch (error: any) {
    logger.error("❌ Error in handleGameFinish:", error.message || error);
    io.to(socket.id).emit("error", "An error occurred while finishing the game.");
  }
}

async function creditToWallet(userId: string, amount: number, currency: string, network: string, remarks: string) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) return;
  const balanceEntry = wallet.balances.find(b => b.currency === currency && b.network === network);
  if (balanceEntry) {
    balanceEntry.availableBalance += amount;
  } else {
    wallet.balances.push({ currency, balance: 0, availableBalance: amount, network });
  }
  await wallet.save();
  await Transaction.create({
    userId,
    transactionAmount: amount,
    transactionType: transactionType.winner_reward,
    transactionStatus: transactionStatus.SUCCESS,
    currency,
    network,
    remarks
  });
}


async function removePlayer(socketId: string) {
  await Matchmaking.deleteOne({ socketId });
  // logger.info(`Player with socket ${socketId} removed from queue`);
}
const findMatchWithOpponent = async (payload: JoinGame): Promise<IOpponent | null> => {
  const { userId, gameId, subGameId } = payload;
  const opponent: any | null = await Matchmaking.findOne({
    gameId,
    subGameId,
    status: "waiting",
    userId: { $ne: userId }
  }).populate<{ userId: IUser }>("userId", "firstName lastName avatarUrl");

  if (!opponent || !opponent.userId) {
    return null; // No opponent found
  }

  return {
    socketId: opponent.socketId,
    userId: opponent.userId._id.toString(),
    firstName: opponent.userId.firstName || "Unknown",
    lastName:opponent.userId.lastName,
    avatarUrl: opponent.userId.avatarUrl
  };
};

async function trackDailyActiveUser(userId: string) {
  const today = dayjs().format("YYYY-MM-DD");
  try {
    await ActiveUser.updateOne(
      { userId: new mongoose.Types.ObjectId(userId), date: today },
      { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), date: today } },
      { upsert: true }
    );
  } catch (err) {
    logger.error("Error tracking active user:", err);
  }
}

function calculateGameDeductions(price: number, deductionPercent: number) {
  const winningPool = price;
  const totalDeduction = (winningPool * deductionPercent) / 100;
  const burnAmount = totalDeduction * 0.5;
  const referralEach = totalDeduction * 0.25;
  const netToWinner = winningPool - totalDeduction;

  return {
    winningPool,
    totalDeduction,
    burnAmount,
    referralEach,
    netToWinner,
  };
}
async function handleReferralDistribution(
  referralCode: string | null | undefined,
  amount: number,
  currency: string,
  network: string,
  fallbackUserId: string
) {

  const referrer = referralCode ? await userModel.findOne({ referralCode: referralCode }) : null


  if (referrer) {
    const refWallet = await Wallet.findOne({ userId: referrer._id });
    if (!refWallet) return;
    const refBalance = refWallet?.balances.find(b => b.currency === currency && b.network === network);
    if (refBalance) {
      refBalance.availableBalance += amount;
    } else {
      refWallet.balances.push({ currency, balance: 0, availableBalance: amount, network });
    }
    await refWallet.save();
    await Transaction.create({
      userId: referrer._id,
      transactionAmount: amount,
      transactionType: transactionType.referral,
      transactionStatus: transactionStatus.SUCCESS,
      currency,
      network,
      remarks: `Referral reward from game`,
    });
  } else {
    await creditToWallet(fallbackUserId, amount, currency, network, "Referral fallback to company");
  }
}

async function handleBurnOrCompanyShare(
  burn_setting: { currency: string, percentage: number, network: string },
  amount: number,
  currency: string,
  network: string,
  fallbackUserId: string,
  burnTransactionData: BurnTransactionData
) {
  if (currency === burn_setting.currency && network === burn_setting.network) {
    await burningCoinsModel.findOneAndUpdate(
      { currency, network },
      { $inc: { totalBurningAmount: amount } },
      { upsert: true }
    );
    logger.info(`Burned ${amount} ${currency}`);
    await BurningTransaction.create({
      userId: burnTransactionData.userId,
      gameId: burnTransactionData.gameId,
      subGameId: burnTransactionData.subGameId,
      gameResultId: burnTransactionData.gameResultId,
      currency: burnTransactionData.currency,
      network: burnTransactionData.network,
      amountBurned: burnTransactionData.amountBurned
    });
    logger.info(`Burning transaction created for user ${burnTransactionData.userId}`)

  } else {
    await creditToWallet(fallbackUserId, amount, currency, network, "Burn redirected to company");
    logger.info(`Company share ${amount} ${currency}`);
  }
}
async function simulateBotPlay(
  io: Server,
  roomId: string,
  userId: string,
  bot: any,
  userScore: number,
) {
  try {
    const botWins = Math.random() * 100 < bot.winChance;
    const scoreOffset: number = Math.floor(Math.random() * 10) + 1;


    let botScore: number = 0;
    botScore = botWins ? Number(userScore) + Number(scoreOffset) : Number(Math.max(0, userScore - scoreOffset));

    logger.info(`Bot ${bot.name} played with score: ${botScore}`);

    const game = await GameResult.findOne({ roomId })
      .populate<{ playerId: IUser }>("playerId", "firstName lastName avatarUrl referredBy")
      .populate<{ botId: IBot }>("botId", "name avatarUrl")
      .populate<{ subGameId: ISubGame }>("subGameId", "price entry currency network")

    if (!game) {
      logger.error(`❌ Game result not found for roomId: ${roomId}`);
      return;
    }
    game.opponentScore = botScore;
    game.status = "finished";
    await game.save();
    await subgameModel.updateOne({ _id: game.subGameId?._id, activeUsers: { $gte: 2 } }, { $inc: { activeUsers: -2 } })
    const player = game.playerId;
    const subGame = game.subGameId;
    const settings = await Settings.findOne().lean<ISettings>();
    const {
      winningPool,
      totalDeduction,
      burnAmount,
      referralEach,
      netToWinner,
    } = calculateGameDeductions(subGame.price, (settings?.win_deduction_percentage || 10));
    const companyId = "67f0c16d590de0594bc56742";
    const winnerIsUser = !botWins;
    if (winnerIsUser) {
      await creditToWallet(
        userId,
        netToWinner,
        subGame.currency,
        subGame.network,
        `Winning reward from game ${roomId}`
      );
    } else {
      await creditToWallet(
        companyId,
        netToWinner,
        subGame.currency,
        subGame.network,
        `User lost to bot — company profit from game ${roomId}`
      );
    }
    const burnCoinsSetting = {
      currency: settings?.win_coin_percentage_burn.currency || "GMG",
      percentage: settings?.win_coin_percentage_burn.parentage || 5,
      network: settings?.win_coin_percentage_burn.network || "GMG Testnet"

    }
    const burnTransactionData: BurnTransactionData = {
      userId: winnerIsUser ? userId : companyId,
      gameId: (game.gameId as any) as string,
      subGameId: (game.subGameId as any) as string,
      gameResultId: (game?._id as any) as string,
      currency: subGame.currency,
      network: subGame.network,
      amountBurned: burnAmount

    }
    await handleBurnOrCompanyShare(burnCoinsSetting, burnAmount, subGame.currency, subGame.network, companyId, burnTransactionData);
    await handleReferralDistribution(player?.referredBy, referralEach, subGame.currency, subGame.network, companyId);

    const botPlayer = {
      id: bot._id.toString(),
      firstName: bot.name,
      lastName:"",
      avatarUrl: bot.avatarUrl || "",
      score: botScore,
      earn: botWins ? netToWinner : 0,
      loseAmount: botWins ? 0 : subGame.entry
    };

    const realPlayer = {
      id: player._id.toString(),
      firstName: player.firstName || "Unknown",
      lastName:player.lastName || "",
      avatarUrl: player.avatarUrl || "",
      score: userScore,
      earn: winnerIsUser ? netToWinner : 0,
      loseAmount: winnerIsUser ? 0 : subGame.entry
    };
    io.to(roomId).emit("gameResult", {
      winner: winnerIsUser ? realPlayer : botPlayer,
      loser: winnerIsUser ? botPlayer : realPlayer
    });
  } catch (error: any) {
    logger.error("❌ Error in simulateBotPlay:", error.message || error);
    io.to(roomId).emit("error", "Failed to simulate game with bot.");
  }
}
