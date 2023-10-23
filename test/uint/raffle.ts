import { deployments, getNamedAccounts, ethers, network } from 'hardhat';
import { Raffle, VRFCoordinatorV2Mock } from '../../typechain-types';
import { BigNumberish, ContractRunner } from 'ethers';
import { assert, expect } from 'chai';
import { networkConfig } from '../../config/network';

describe('Raffle Uint Test', () => {
    let deployer: any;
    let raffle: Raffle;
    let raffleContract: Raffle;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
    let raffleEntranceFee: BigNumberish;
    let interval: number;

    beforeEach(async () => {
        deployer = (await ethers.getSigners())[1];
        await deployments.fixture(['all']);
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
        raffleContract = await ethers.getContract('Raffle');
        raffle = raffleContract.connect(deployer as any);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = Number(await raffle.getInterval());
    });

    describe('constructor', () => {
        it('intitiallizes the raffle correctly', async () => {
            console.log(network.config.chainId);
            const raffleState = await raffle.getRaffleState();

            assert.equal(raffleState.toString(), '0');
            assert.equal(interval.toString(), networkConfig[network.config.chainId!]['keepersUpdateInterval']);
        });
    });

    describe('enterRaffle', () => {
        it("reverts when you don't pay enough", async () => {
            await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, 'Raffle__SendMoreToEnterRaffle');
        });

        it('records player when they enter', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            const raffleSender = await raffle.getPlayer(0);
            assert.equal(deployer.address, raffleSender);
        });

        it('emits event on enter', async () => {
            await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, 'RaffleEnter');
        });

        it('returns true if enough time has passed, has players, eth, and is open', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [interval + 1]);
            await network.provider.request({ method: 'evm_mine', params: [] });
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall(new Uint8Array());
            assert(upkeepNeeded);
        });
    });

    describe('performUpkeep', () => {
        it('can only run if checkupkeep is true', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [interval + 1]);
            await network.provider.request({ method: 'evm_mine', params: [] });
            const tx = await raffle.performUpkeep(new Uint8Array());
            assert(tx);
        });

        it('reverts if checkup is false', async () => {
            await expect(raffle.performUpkeep(new Uint8Array())).to.be.revertedWithCustomError(
                raffle,
                'Raffle__UpkeepNotNeeded',
            );
        });
        it('updates the raffle state and emits a requestId', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [interval + 1]);
            await network.provider.request({ method: 'evm_mine', params: [] });
            const tx = await raffle.performUpkeep(new Uint8Array());
            const txReceipt = await tx.wait(1);
            const raffleDeployment = await deployments.get('Raffle');
            const raffleInterface = new ethers.Interface(raffleDeployment.abi);
            const parsedLogs = (txReceipt?.logs || []).map((log) => {
                return raffleInterface.parseLog({
                    topics: [...log?.topics] || [],
                    data: log?.data || '',
                });
            });
            const requestId: bigint = parsedLogs[1]?.args[0] || BigInt(0);
            const raffleState = await raffle.getRaffleState();
            assert(Number(requestId.toString()) > 0);
            assert(Number(raffleState.toString()) == 1);
        });
    });
});
