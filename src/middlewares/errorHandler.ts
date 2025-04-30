import { NextFunction,Request,Response } from 'express';
import {logger} from '../utils/logger';

export const errorHandler=(err:any,_:Request,res:Response,next:NextFunction)=>{
    logger.error(err.stack);
    res.status(err.status || 500)
    .json({message:err.message || "Internal Server Error"});
}