import { DepositRepository } from "../repositories/deposit.repository";
import { Request, Response } from 'express';

const depositRepo = new DepositRepository();

export const getAllDeposits = async (query: {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  filter?: string;
  isExport?: boolean
}, res: Response) => {
  return await depositRepo.getAllDeposits(query, res);
};