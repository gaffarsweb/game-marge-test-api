import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { schedulePracticeLimitReset } from "./utils/practiceLimitReset.job"; // Adjust path

/*   ***Routes import***     */
import authRoutes from './routes/auth-routes';
import gamesRoutes from './routes/game-routes';
import subgamesRoutes from './routes/subgame.routes';
import practiceGamesRoutes from './routes/practicegame.routes';
import transactionsRoutes from './routes/transactionsRoutes.routes';
import botRoutes from './routes/bot.routes';
import newsRoutes from './routes/news.routes';
import promotionsRoutes from './routes/promotionsRoutes.routes';
import notificationsRoutes from './routes/notifications.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import settingRoutes from './routes/setting.routes';
import airdropRoutes from './routes/airdrop.routes';
import airdropEventRoutes from './routes/airdropEvent.routes';
import walletRoutes from './routes/wallet.routes';
import withdrawRoutes from './routes/withdraw.routes';
import historyRoutes from './routes/history.routes';
import tournamentRoutes from './routes/tournament.routes';
import tournamentParticipationRoutes from './routes/tournamentParticipation.routes';
import leaderboardsRoutes from './routes/leaderboardsRoutes.routes';
import spinRoutes from './routes/spin.routes';
import gamergeConfigurationRoutes from './routes/gamergeCoinConfiguration.routes';
import burnEventRoutes from './routes/burnevent.routes';
import chatMessageRoutes from './routes/chatmessage.routes';

import { connectDB } from './utils/db';
import { setupSocket } from './utils/socket';
import { startTournamentRewardCron, startTournamentStatusUpdateCron } from "./utils/cronJobs/tournamentCron";
import { scheduleUSDRateUpdates } from "./utils/cronJobs/getUsdRate.job";
import { updateBalanceOfAllUsers } from "./utils/cronJobs/updateBalanceOfAllUsers";
dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(errorHandler);

app.use((req: Request, _: Response, next: NextFunction) => {
  logger.info(`Processing request for ${req.method} ${req.url}`);
  logger.info(`Request body : ${JSON.stringify(req.body)}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/subgames', subgamesRoutes);
app.use('/api/practicegames', practiceGamesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/promotion', promotionsRoutes);
app.use('/api/notification', notificationsRoutes);
app.use('/api/dashboard',dashboardRoutes);
app.use('/api/settings',settingRoutes);
app.use('/api/transactions',transactionsRoutes);
app.use('/api/airdrops', airdropRoutes); 
app.use('/api/airdrop-events', airdropEventRoutes);
app.use('/api/wallet', walletRoutes); 
app.use('/api/withdraw', withdrawRoutes); 
app.use('/api/history', historyRoutes); 
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/tournament-participations', tournamentParticipationRoutes);
app.use('/api/leaderboard', leaderboardsRoutes);
app.use('/api/spin', spinRoutes);
app.use('/api/gamerge-configuration', gamergeConfigurationRoutes);
app.use('/api/burn-events', burnEventRoutes);
app.use('/api/messages', chatMessageRoutes);


 
app.get("/", (_: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to Gamerge services." });
});
app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy" });
});
schedulePracticeLimitReset();
startTournamentRewardCron()
startTournamentStatusUpdateCron();
scheduleUSDRateUpdates();
updateBalanceOfAllUsers();
setupSocket(io);
server.listen(port, () => {
  connectDB();
  logger.info(`Server is running on port ${port}`);
});
