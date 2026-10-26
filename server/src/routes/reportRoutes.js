import express from 'express';
import { getAnalyticsReport, exportReportCsv } from '../controllers/reportController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, requireAdmin, getAnalyticsReport);
router.get('/export/csv', protect, requireAdmin, exportReportCsv);

export default router;
