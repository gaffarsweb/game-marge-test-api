import mongoose from "mongoose";
import permissionModel from "../models/permission.model"
import networksModel, { INetwork } from "../models/networks.model";



export class networksRepository {


    async updateNetworks(body: Partial<INetwork> & { networkId: string }): Promise<any> {
        console.log(body)
        try {
            const requiredFields = ["name", "rpc", "currency", "image", "chainId"];
            for (const field of requiredFields) {
                if (!body[field as keyof INetwork]) {
                    return {
                        status: false,
                        code: 400,
                        msg: `Missing required field: ${field}`,
                    };
                }
            }

            if (!body?.networkId) {
                return {
                    status: false,
                    code: 400,
                    msg: "networkId is required",
                };
            }

            const existingNetwork = await networksModel.findById(body.networkId);
            if (!existingNetwork) {
                return {
                    status: false,
                    code: 404,
                    msg: "Network does not exist",
                };
            }

            // Check for duplicate chainId (excluding current network)
            const duplicateChainId = await networksModel.findOne({
                chainId: body.chainId,
                _id: { $ne: body.networkId },
            });
            if (duplicateChainId) {
                return {
                    status: false,
                    code: 409,
                    msg: "Another network with this chainId already exists",
                };
            }

            const duplicateCurrency = await networksModel.findOne({
                currency: body.currency,
                _id: { $ne: body.networkId },
            });
            if (duplicateCurrency) {
                return {
                    status: false,
                    code: 409,
                    msg: "Another network with this currency already exists",
                };
            }

            const duplicateRPC = await networksModel.findOne({
                rpc: body.rpc,
                _id: { $ne: body.networkId },
            });
            if (duplicateRPC) {
                return {
                    status: false,
                    code: 409,
                    msg: "Another network with this RPC URL already exists",
                };
            }

            const updatedNetwork = await networksModel.findByIdAndUpdate(
                body.networkId,
                {
                    name: body.name,
                    rpc: body.rpc,
                    currency: body.currency,
                    image: body.image,
                    chainId: body.chainId,
                    tokens: body.tokens || [],
                },
                { new: true } // return updated doc
            );

            return {
                status: true,
                code: 200,
                msg: "Network updated successfully",
                data: updatedNetwork,
            };
        } catch (error: any) {
            return {
                status: false,
                code: 500,
                msg: error.message || "Internal server error",
                data: error,
            };
        }
    }

    async createNetwork(body: Partial<INetwork>): Promise<{
        status: boolean;
        code: number;
        msg: string;
        data?: any;
    }> {
        try {
            const requiredFields = ["name", "rpc", "currency", "image", "chainId"];
            for (const field of requiredFields) {
                if (!body[field as keyof INetwork]) {
                    return {
                        status: false,
                        code: 400,
                        msg: `Missing required field: ${field}`,
                    };
                }
            }

            const existing = await networksModel.findOne({ chainId: body.chainId });
            if (existing) {
                return {
                    status: false,
                    code: 409,
                    msg: "Network with this chainId already exists"
                };
            }
            const existingCurrency = await networksModel.findOne({ currency: body.currency });
            if (existingCurrency) {
                return {
                    status: false,
                    code: 409,
                    msg: "Network with this currency already exists"
                };
            }
            const existingRPC = await networksModel.findOne({ rpc: body.currency });
            if (existingRPC) {
                return {
                    status: false,
                    code: 409,
                    msg: "Network with this RPC URL already exists"
                };
            }

            const createdNetwork = await networksModel.create(body);

            return {
                status: true,
                code: 200,
                msg: "Network created successfully",
                data: createdNetwork
            };
        } catch (error: any) {
            return {
                status: false,
                code: 500,
                msg: error.message || "Internal server error",
                data: error
            };
        }
    }

    async getNetworks(): Promise<any> {
        try {
            const data = await networksModel.find().sort({ _id: 1 })
            if (data) {
                return {
                    status: true,
                    code: 200,
                    data: data,
                    msg: 'networks data retrieved'
                }
            } else {
                return {
                    status: false,
                    code: 400,
                    data: null,
                    msg: 'no data found'
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