import { ethers } from 'ethers';
import { z } from 'zod';
import destripeAbi from '../abi/Destripe.json';
import destripeCollectionAbi from '../abi/DestripeCollection.json';

const envSchema = z.object({
  NETWORK: z.string(),
  INFURA_API_KEY: z.string(),
  PRIVATE_KEY: z.string(),
  DESTRIPE_CONTRACT: z.string(),
  COLLECTION_CONTRACT: z.string(),
});

const env = envSchema.parse(process.env);

export function getContract() {
  const provider = new ethers.InfuraProvider(env.NETWORK, env.INFURA_API_KEY);
  const contract = new ethers.Contract(env.DESTRIPE_CONTRACT, destripeAbi, provider);
  return contract;
}

export function getCollectionContract() {
  const provider = new ethers.InfuraProvider(env.NETWORK, env.INFURA_API_KEY);
  const contract = new ethers.Contract(env.COLLECTION_CONTRACT, destripeCollectionAbi, provider);
  return contract;
}

export function getSigner() {
  const provider = new ethers.InfuraProvider(env.NETWORK, env.INFURA_API_KEY);
  const signer = new ethers.Wallet(env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(env.DESTRIPE_CONTRACT, destripeAbi, signer);
  return contract;
}

export function getCustomer() {
  return getContract().getCustomers();
}

export type Customer = {
  tokenId: number;
  index: number;
  nextPayment: number;
};

export function getCustomerInfo(customerAddress: string): Promise<Customer> {
  return getContract().payments(customerAddress) as Promise<Customer>;
}

export async function pay(customer: string) {
  const tx = await getSigner().pay(customer);
  const receipt = await tx.wait();
  return receipt.hash;
} 