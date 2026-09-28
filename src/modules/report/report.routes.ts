import { Router, Request, Response } from 'express';
import { ReportService } from './report.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'LIBRARIAN'));

router.get('/overdue', asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getOverdueReport();
  return ApiResponse.success(res, result);
}));

router.get('/most-borrowed', asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as string) || '30d';
  const result = await ReportService.getMostBorrowed(period);
  return ApiResponse.success(res, result);
}));

router.get('/inventory-summary', asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getInventorySummary();
  return ApiResponse.success(res, result);
}));

router.get('/dashboard-summary', asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getDashboardSummary();
  return ApiResponse.success(res, result);
}));

export const reportRoutes = router;
