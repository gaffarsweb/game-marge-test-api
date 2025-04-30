import axios from 'axios';

async function fetchTokenPrices(symbols: string[]): Promise<Record<string, number>> {
    const symbolMap: Record<string, string> = {
        ETH: 'ethereum',
        USDT: 'tether',
        BNB: 'binancecoin',
        tBNB: 'binancecoin',
        SepoliaETH: 'ethereum',
        // GMG: 'your-token-id',  // if your token is listed
        // tGMG: 'your-token-id',
    };

    const coinIds = symbols.map(sym => symbolMap[sym]).filter(Boolean);
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
            ids: coinIds.join(','),
            vs_currencies: 'usd'
        }
    });

    const prices: Record<string, number> = {};
    for (const [symbol, id] of Object.entries(symbolMap)) {
        const price = response.data[id]?.usd;
        if (price) prices[symbol] = price;
    }

    return prices;
};
export default fetchTokenPrices;
