import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { network } from 'hardhat';
import { developmentChains, networkConfig, VERIFICATION_BLOCK_CONFIRMATIONS } from '../config/network';

const FUND_AMOUNT = '1000000000000000000000';
const deployRaffle: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const deployer = (await getNamedAccounts()).deployer;
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    // const chainId = 31337
    let vrfCoordinatorV2Address: string | undefined, subscriptionId: string | undefined;

    if (chainId === 31337) {
        const vrfCoordinatorV2Mock: any = await deployments.get('VRFCoordinatorV2Mock');
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[network.config.chainId!]['vrfCoordinatorV2'];
        subscriptionId = networkConfig[network.config.chainId!]['subscriptionId'];
    }

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;

    log('----------------------------------------------------');
    const args: any[] = [
        vrfCoordinatorV2Address,
        networkConfig[network.config.chainId!]['raffleEntranceFee'],
        networkConfig[network.config.chainId!]['keepersUpdateInterval'],
        subscriptionId,
        networkConfig[network.config.chainId!]['gasLane'],
        networkConfig[network.config.chainId!]['callbackGasLimit'],
    ];
    const raffle = await deploy('Raffle', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });


    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        // await verify(raffle.address, args)
    }

    log("Run Price Feed contract with command:")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(`yarn hardhat run scripts/enterRaffle.ts --network ${networkName}`)
    log("----------------------------------------------------")
};

deployRaffle.tags = ['all', 'Raffle'];
export default deployRaffle;
