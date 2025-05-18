import { NextFunction ,Response} from "express";
import { CustomRequest } from "../interfaces/auth.interface";
import { sendErrorResponse } from "../utils/apiResponse";
import { HTTP_MESSAGE, HTTP_STATUS } from "../utils/httpStatus";
type Role='user' | 'admin' | 'superAdmin';
export const authorizeRoles=(roles:Role[]):any=>{
  return (req:CustomRequest,res:Response,next:NextFunction):void=>{
        const userRole=req.user?.role;
        const isAllowed=roles.some((role)=>role===userRole);
        isAllowed? next(): sendErrorResponse(
            res,
            "You don't have authority to perform this action.",
            HTTP_MESSAGE.FORBIDDEN,
            HTTP_STATUS.FORBIDDEN
        )
  }
}