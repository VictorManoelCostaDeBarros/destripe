import { NextFunction, Request, Response, Router } from 'express';
import { ownerOf, getImageUrl } from '../services/nft';
import { ethers } from 'ethers';

const router = Router();

router.get('/:tokenId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenId = req.params.tokenId.replace('.json', '');
    const ownerAddress = await ownerOf(tokenId);
    if (ownerAddress === ethers.ZeroAddress) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    res.json({
      name: 'Access #' + tokenId,
      description: 'Your access to the system X',
      image: getImageUrl(tokenId),
    });
  } catch (err) {
    next(err);
  }
});

export default router; 