import { Router } from 'express';
import { requireTenantAndUser } from '../middleware';
import { getCurrentUser } from '../controllers/usersController';

const router = Router();

router.get('/me', requireTenantAndUser, getCurrentUser);

export default router;
