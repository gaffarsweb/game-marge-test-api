import { Schema } from "mongoose";
import { IUser } from "../models/user.model";
import { IUpdateUser } from "./auth.interface";
import { IPagination } from "./news.interface";

export interface IUserRepository{
    getUserById(id: Schema.Types.ObjectId): Promise<IUser | null>;
    updateUser(id: Schema.Types.ObjectId, payload: IUpdateUser): Promise<IUser>;
    deleteUserById(id: Schema.Types.ObjectId): Promise<IUser | null>;
    findAllUsers(query:IPagination): Promise<{data:IUser[],count:number}>;
    getReferredUsers(referralCode:string): Promise<IUser[]>;

}

