import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';
import '@nomicfoundation/hardhat-verify';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.9',
            },
        ],
    },
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
        outputFile: 'gas-report.txt',
        noColors: true,
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
};

export default config;
