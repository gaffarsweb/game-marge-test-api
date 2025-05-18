import mongoose, { Types } from "mongoose";
import { ChatMessages } from "../interfaces/chatmessage.interface";
import ChatMessage from "../models/chatmessage.model";
import userModel from "../models/user.model";

export class ChatMessageRepository {
	async getMessagesBtnTwoUsers(payload: ChatMessages): Promise<any[]> {
		const messages = await ChatMessage.find({
			$or: [
				{ senderId: payload.senderId, receiverId: payload.receiverId },
				{ senderId: payload.receiverId, receiverId: payload.senderId },
			],
		})
			.sort({ createdAt: 1 });
		return messages;
	}
	async getAdminConversations(): Promise<any> {
		const adminId = process.env.ADMIN_USER_ID || "67f0c16d590de0594bc56742";

		const aggregate = await ChatMessage.aggregate([
			{ $match: { receiverId: new Types.ObjectId(adminId) } },
			{
				$group: {
					_id: "$senderId",
					lastMessage: { $last: "$$ROOT" },
					unreadCount: {
						$sum: {
							$cond: [{ $eq: ["$isRead", false] }, 1, 0]
						}
					}
				}
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					userId: "$_id",
					name: "$user.name",
					avatar: "$user.avatarUrl",
					lastMessage: 1,
					unreadCount: 1
				}
			}
		]);

		return aggregate;
	}
	async getUserDetails({ userId }: { userId: string }): Promise<any> {
		try {
			const userData = await userModel.aggregate([
				{
					$match: {
						_id: new mongoose.Types.ObjectId(userId)
					}
				},
				{
					$lookup: {
						from: 'wallets',
						localField: '_id',
						foreignField: 'userId',
						as: 'walletDetails'
					}
				},
				{
					$unwind: {
						path: "$walletDetails",
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$project: {
						_id: 1,
						name: 1,
						email: 1,
						createdAt: 1,
						isEmailVerified: 1,
						'walletDetails.address': 1,
						'walletDetails.balances': 1
					}
				}
			]);

			return {
				status: true,
				code: 200,
				data: userData[0] || null  
			};
		} catch (error) {
			console.error("Error while fetching users with messages:", error);
			return {
				status: false,
				code: 500,
				msg: error instanceof Error ? error.message : "Internal server error"
			};
		}
	}


}