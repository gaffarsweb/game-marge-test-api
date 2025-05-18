import { IBurnEventRepository } from "../interfaces/burnevent.interface";
import burnCoinHistoryModel from "../models/burnCoinHistory.model";
import burningCoinsModel from "../models/burningCoins.model";
import burningEventModel, { IBurningEvent } from "../models/burningEvent.model";
import gamergeCoinConfigurationModel from "../models/gamergeCoinConfiguration.model";

export class BurnEventRepository implements IBurnEventRepository {
  async getBurnEvents(): Promise<any> {
    const event = await burningEventModel.findOne({ eventDate: { $gte: new Date() } }).sort({ eventDate: 1 });
    if (!event) {
      throw new Error("Burning event not found");
    }
    const config = await gamergeCoinConfigurationModel.findOne({});
    const burnCoin = await burningCoinsModel.findOne({});

    if (!config || !burnCoin) {
      throw new Error("Configuration or burning coin not found");
    }

    const availableSupply = config.totalSupply - (burnCoin.totalBurned || 0);
    const data = {
      id: event._id,
      eventDate: event.eventDate,
      targetBurnAmount: event.targetBurnAmount,
      totalSupply: config.totalSupply,
      totalBurned: burnCoin.totalBurned || 0,
      availableSupply,
      pendingBurn: burnCoin.totalBurningAmount || 0,
    };
    return data;
  }
  async triggerBurnEvent(userId: string, eventId: string): Promise<void> {
    const burnevent = await burningEventModel.findById(eventId);
    if (!burnevent) {
      throw new Error("Burning event not found");
    }
    const burnCoin = await burningCoinsModel.findOne({});
    if (!burnCoin) {
      throw new Error("Burning coin not found");
    }
    const amountToBurn = burnCoin.totalBurningAmount || 0;
    if (amountToBurn <= 0) {
      throw new Error("No amount to burn");
    }
    const config = await gamergeCoinConfigurationModel.findOne({});
    const totalSupply=config?.totalSupply || 0;
    const availableToken =( config?.totalSupply || 0) - (burnCoin.totalBurned || 0);

    burnCoin.totalBurned += amountToBurn;
    burnCoin.totalBurningAmount = 0;
    await burnCoin.save();
    await burnCoinHistoryModel.create({
      userId,
      burnEventId: eventId,
      totalSupply,
      burnTarget: burnevent.targetBurnAmount,
      availableToken,
      totalTokenBurned: amountToBurn,
      burnDate: new Date(),
      remarks: "Burning event triggered",
    });
    return;
  }

  async getBurnCoinHistory(): Promise<any> {
    const burnCoinHistory = await burnCoinHistoryModel
      .find({})
      .sort({ burnDate: -1 });
    if (!burnCoinHistory) {
      throw new Error("Burning coin history not found");
    }
    const burnCoinHistoryData = burnCoinHistory.map((history) => {
      return {
        id: history._id,
        userId: history.userId,
        burnEventId: history.burnEventId,
        totalSupply: history.totalSupply,
        burnTarget: history.burnTarget,
        availableToken: history.availableToken,
        totalTokenBurned: history.totalTokenBurned,
        burnDate: history.burnDate,
        remarks: history.remarks,
      };
    })
    return burnCoinHistoryData;
  }
  async getBurnEventById(id: string): Promise<IBurningEvent> {
    const event = await burningEventModel.findById(id);
    if (!event) {
      throw new Error("Burning event not found");
    }
    return event;
  }
  async createBurnEvent(burnEvent: IBurningEvent): Promise<IBurningEvent> {
    const newBurnEvent = new burningEventModel(burnEvent);
    return await newBurnEvent.save();
  }
  async updateBurnEvent(
    id: string,
    burnEvent: Partial<IBurningEvent>
  ): Promise<IBurningEvent> {
    const updatedBurnEvent = await burningEventModel.findByIdAndUpdate(
      id,
      burnEvent,
      { new: true }
    );
    if (!updatedBurnEvent) {
      throw new Error("Burning event not found");
    }
    return updatedBurnEvent;
  }
  async deleteBurnEvent(id: string): Promise<IBurningEvent> {
    const deletedBurnEvent = await burningEventModel.findByIdAndDelete(id);
    if (!deletedBurnEvent) {
      throw new Error("Burning event not found");
    }
    return deletedBurnEvent;
  }
}
