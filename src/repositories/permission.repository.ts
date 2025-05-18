import mongoose from "mongoose";
import permissionModel from "../models/permission.model"



export class permissionRepository {
    async addUpdatePermission(body: any): Promise<any> {
        try {
            const permissionData = await permissionModel.findOneAndUpdate(
                { userId: body?.userId },
                {
                    $set: {
                        permissions: body?.permissions,
                        allPermission: body?.allPermission
                    }
                },
                { upsert: true, new: true }
            );

            if (permissionData) {
                return {
                    status: true,
                    code: 200,
                    msg: "permission added successfully",
                    data: permissionData
                };
            };
        } catch (error: any) {
            return {
                status: false,
                code: 500,
                msg: error.message,
                data: error
            }
        }
    };

    async getPermissions(userId: mongoose.Types.ObjectId): Promise<any> {
        try {
            const data = await permissionModel.findOne({userId})
            if(data){
                return{
                    status:true,
                    code : 200,
                    data : data,
                    msg:'permission data retrieved'
                }
            }else{
                return{
                    status:false,
                    code:400,
                    data:null,
                    msg:'no data found'
                }
            }
        } catch (error: any) {
            return {
                status: false,
                code: 500,
                data: error,
                msg: error.message
            }
        }
    }
}