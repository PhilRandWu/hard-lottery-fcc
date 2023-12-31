import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { network } from 'hardhat';

const BASE_FEE = '250000000000000000'; // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

const deployMock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const deployer = (await getNamedAccounts()).deployer;
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    log('Local network detected! Deploying mocks...');
    await deploy('VRFCoordinatorV2Mock', {
        from: deployer,
        log: true,
        args: [BASE_FEE, GAS_PRICE_LINK],
    });
    log('Mocks Deployed!');
    log('----------------------------------');

    log("You are deploying to a local network, you'll need a local network running to interact");
    log('Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!');
    log('----------------------------------');
};

deployMock.tags = ['all','mock'];
export default deployMock;