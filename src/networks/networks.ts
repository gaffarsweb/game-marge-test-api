export let networks = [
	{
		"name": "BNB Smart Chain Testnet",
		"rpc": "https://data-seed-prebsc-1-s1.binance.org:8545/",
		"currency": "tBNB",
		"image": "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745300474366-image-%2811%29.png",
		"chainId": 97,
		"tokens": [
			{
				"chainId": 97,
				"tokenSymbol": "USDT",
				"tokenAddress": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
				"image": "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745229263535-usdt.png",
				
			}
		]
	},
	{
		"name": "GMG Testnet",
		"rpc": "https://data-seed-prebsc-1-s1.binance.org:8545/",
		"currency": "tGMG",
		"image": "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745229330985-Group-2574.png",
		"chainId": 90,
		"tokens": []
	},
	{
		"name": "Ethereum Sepolia Testnet",
		"rpc": `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
		"currency": "SepoliaETH",
		"image": "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745300531919-image-%2812%29.png",
		"chainId": 11155111,
		"tokens": []
	},
	{
		"name": "Ethereum Mainnet",
		"rpc": "https://eth.llamarpc.com",
		"image": "https://gamerge-bucket.s3.ap-south-1.amazonaws.com/images/1745300418401-image-%2810%29.png",
		"currency": "ETH",
		"chainId": 1,
		"tokens": []
	},
	// {
	// 	"name": "BNB Smart Chain Mainnet",
	// 	"rpc": "https://bsc-dataseed.binance.org",
	// 	"currency": "BNB",
	// 	"chainId": 56,
	// 	"tokens": [
	// 		{
	// 			"chainId": 56,
	// 			"tokenSymbol": "USDT",
	// 			"tokenAddress": "0x55d398326f99059ff775485246999027b3197955"
	// 		}
	// 	],
	// 	"isTestnet": false
	// }
]
 