import { securityRepository } from "../repositories/security.repository";

const depositRepo = new securityRepository();

export const AddSecurityIp = async (body: any) => {
  return await depositRepo.AddSecurityIp(body);
};
export const getWhitelistIp = async () => {
  return await depositRepo.getWhitelistIp();
};
export const checkWhiteListIp = async (ip: any) => {
  return await depositRepo.checkWhiteListIp(ip);
};