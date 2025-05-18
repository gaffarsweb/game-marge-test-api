import { networksRepository } from "../repositories/networks.repository";

const networksRepo = new networksRepository();

export const createNetwork = async (body: any) => {
    return await networksRepo.createNetwork(body)
};
export const updateNetworks = async (body: any) => {
    return await networksRepo.updateNetworks(body)
};

export const getNetworks = async ()=>{
    return await networksRepo.getNetworks();
};