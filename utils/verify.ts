import hre from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
    console.log('verifying contract...');
    try {
        await hre.run('verify:verify', {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        if (e.message.toLowerCase().includes('already verified')) {
            console.log('contract verified!');
        } else {
            console.log(e);
        }
    }
}