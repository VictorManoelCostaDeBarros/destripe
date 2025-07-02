import express from 'express';
import { ownerOf } from '../services/nft';
import { ethers } from 'ethers';
import path from 'path';

const router = express.Router();

router.get('/:tokenId', async (req, res, next) => {
  try {
    const tokenId = req.params.tokenId.replace('.png', '');
    const ownerAddress = await ownerOf(tokenId);
    if (ownerAddress === ethers.ZeroAddress) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    const imagePath = path.join(__dirname, '..', 'images', `${tokenId}.png`);
    res.download(imagePath);
  } catch (err) {
    next(err);
  }
});

export default router; 