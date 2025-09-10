import { Router, Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// GET /api/organizations - list organizations (simple, no auth for seeding/dev)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const orgs = await Organization.find({}, { name: 1, domain: 1 }).limit(100).lean();
    res.json({ success: true, data: orgs });
  })
);

export default router;
