import { ethers } from 'ethers';
import { z } from 'zod';
import destripeCollectionAbi from '../abi/DestripeCollection.json';

const envSchema = z.object({
  NETWORK: z.string(),
  INFURA_API_KEY: z.string(),
  COLLECTION_CONTRACT: z.string(),
  BACKEND_URL: z.string(),
});

const env = envSchema.parse(process.env);

export function getCollectionContract() {
  const provider = new ethers.InfuraProvider(env.NETWORK, env.INFURA_API_KEY);
  const contract = new ethers.Contract(env.COLLECTION_CONTRACT, destripeCollectionAbi, provider);
  return contract;
}

export async function ownerOf(tokenId: string) {
  return getCollectionContract().ownerOf(tokenId);
}

export function getImageUrl(tokenId: string) {
  return `${env.BACKEND_URL}/images/${tokenId}.png`;
} 