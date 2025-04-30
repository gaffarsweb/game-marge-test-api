import { SortOrder } from "mongoose";
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
			.sort({ createdAt: -1 });
		return messages;
	}
	async createNewMessage(payload: any): Promise<any> {
		const newMessage = await ChatMessage.create(payload);
		return newMessage;
	}

	async getUsersWhoHasMessaged(query: { page?: string, limit?: string, sort?: string, search?: string, filter?: string }): Promise<any> {
		try {
			const page = query.page ? parseInt(query.page, 10) : 1;
			const limit = query.limit ? parseInt(query.limit, 10) : 10;
			const sortOrder = query.sort ? Number(query.sort) : -1;
			const search = query.search ?? '';
			const filter = query.filter ? JSON.parse(query.filter) : {};

			const matchUserFilter: any = {
				...filter,
				...(search
					? { name: { $regex: search, $options: 'i' } }
					: {})
			};

			const result = await ChatMessage.aggregate([
				{
					$group: {
						_id: "$senderId",
						latestMessageDate: { $max: "$createdAt" }
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
				{ $match: { "user.name": matchUserFilter.name ?? /.*/ } },
				{
					$lookup: {
						from: "chatmessages",
						let: { senderId: "$_id" },
						pipeline: [
							{ $match: { $expr: { $eq: ["$senderId", "$$senderId"] } } },
							{ $sort: { createdAt: -1 } }
						],
						as: "messages"
					}
				},
				{
					$project: {
						_id: "$user._id",
						name: "$user.name",
						email: "$user.email",
						messages: 1,
						latestMessageDate: 1
					}
				},
				{ $sort: { latestMessageDate: sortOrder as 1 | -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit }
			]);

			const count = await ChatMessage.aggregate([
				{ $group: { _id: "$senderId" } },
				{
					$lookup: {
						from: "users",
						localField: "_id",
						foreignField: "_id",
						as: "user"
					}
				},
				{ $unwind: "$user" },
				{ $match: { "user.name": matchUserFilter.name ?? /.*/ } },
				{ $count: "total" }
			]);

			const totalResult = count[0]?.total ?? 0;

			return {
				status: true,
				code: 200,
				data: {
					result,
					page,
					limit,
					totalResult
				}
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