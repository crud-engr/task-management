import { Router } from 'express';
import { requireTenant } from '../middleware';
import {
  getExportStatus,
  downloadExportFile,
} from '../controllers/exportsController';

const router = Router();

router.get('/:id', requireTenant, getExportStatus);
router.get('/:id/file', requireTenant, downloadExportFile);

export default router;
