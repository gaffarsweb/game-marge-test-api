import { Schema, SortOrder } from "mongoose";
import User from "../models/user.model";
import { logger } from "../utils/logger";
import securityModel from "../models/security.model";

export class securityRepository {
  async AddSecurityIp(body: any): Promise<any> {
    try {
      if (!body.whitelistIp || !Array.isArray(body.whitelistIp) || body.whitelistIp.length === 0) {
        return { status: false, code: 400, msg: "invalid data" };
      }

      const security = await securityModel.findOneAndUpdate(
        {},
        { $set: { whitelistIp: body.whitelistIp } },
        { upsert: true, new: true }
      );

      return {
        status: true,
        code: 200,
        msg: "Whitelist IPs updated successfully",
        data: security
      };
    } catch (error) {
      logger.error("Error in securityRepository AddSecurityIp:", error);
      return {
        status: false,
        code: 500,
        msg: error instanceof Error ? error.message : "Internal server error"
      };
    }
  };

  async getWhitelistIp(): Promise<any> {
    try {
      const security = await securityModel.findOne({});
      if (security.whitelistIp && security.whitelistIp.length > 0) {
        return {
          status: true,
          msg: "white list Ip retrieved ",
          data: security.whitelistIp
        }
      } else {
        return {
          status: false,
          msg: "something when wrong",
          data: null
        }
      }
    } catch (error: any) {
      return {
        status: false,
        msg: error.msg,
        data: null
      }
    }
  }
  async checkWhiteListIp(ip: any): Promise<any> {
    try {
      const security = await securityModel.findOne({});
      if (security.whitelistIp && security.whitelistIp.length > 0) {
        if (security.whitelistIp.includes(ip)) {
          return {
            status: true,
            msg: "access genrated ",
            data: security.whitelistIp
          }
        } else {
          return {
            status: false,
            msg: "access denited ",
            data: null
          }
        }
      } else {
        return {
          status: false,
          msg: "something when wrong",
          data: null
        }
      }
    } catch (error: any) {
      return {
        status: false,
        msg: error.msg,
        data: null
      }
    }
  }

}