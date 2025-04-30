import cron from 'node-cron';
import { logger } from '../logger';
import USDRateModel from '../../models/USDRate.model';
import { networks } from '../../networks/networks';
import fetchTokenPrices from '../fetchTokenPrices';
import gamergeCoinConfigurationModel from '../../models/gamergeCoinConfiguration.model';

// Get all unique symbols from networks and their tokens
function getAllSymbols() {
    const networkSymbols = networks.map(network => network.currency);
    const tokenSymbols = networks.flatMap(network => 
        network.tokens?.map(token => token.tokenSymbol) || []
    );
    
    return [...new Set([...networkSymbols, ...tokenSymbols])];
}

// Save USD rates to database
async function saveUSDRates(rates: Record<string, number>) {
    try {
        const gameMargeConfig = await gamergeCoinConfigurationModel.findOne({});
        if(gameMargeConfig?.currency){
            rates.tGMG = gameMargeConfig?.ratePerGamerge
        };

        await USDRateModel.findOneAndUpdate(
            {},
            { rates}, // 1 hour expiration
            { upsert: true, new: true }
        );
        console.log('USD rates updated successfully');
    } catch (error) {
        logger.error('Error saving USD rates:', error);
        throw error;
    }
}

// Runs every hour to keep rates updated
export const scheduleUSDRateUpdates = () => {
    // Run immediately on startup
    updateUSDRates();
    
    // Then run every hour at minute 0 (e.g., 1:00, 2:00, etc.)
    cron.schedule('* * * * *', updateUSDRates);
};

async function updateUSDRates() {
    try {
        console.log("Updating USD rates...");
        
        // Get all unique symbols (both network currencies and tokens)
        const allSymbols = getAllSymbols();
        
        // Fetch prices for all symbols
        const pricesInUSD = await fetchTokenPrices(allSymbols);
        
        // Save to database
        await saveUSDRates(pricesInUSD);
        
        console.log("USD rates updated successfully");
    } catch (error) {
        logger.error("Error updating USD rates:", error);
    }
}