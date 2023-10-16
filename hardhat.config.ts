import {HardhatUserConfig} from "hardhat/config";
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv';
import '@nomicfoundation/hardhat-verify';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy-ethers';

const config: HardhatUserConfig = {
    solidity: "0.8.19",
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 31337
        }
    }
};

export default config;