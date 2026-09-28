import { Router } from 'express';
import { LoanController } from './loan.controller.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import { authorize } from '../../middleware/authorize.ts';
import { validate } from '../../middleware/validate.ts';
import { asyncHandler } from '../../middleware/asyncHandler.ts';
import { checkoutSchema, loanQuerySchema, reportLostSchema } from './loan.schema.ts';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'LIBRARIAN'), validate({ body: checkoutSchema }), asyncHandler(LoanController.checkout));
router.get('/', validate({ query: loanQuerySchema }), asyncHandler(LoanController.list));
router.get('/:id', asyncHandler(LoanController.getById));
router.patch('/:id/return', authorize('ADMIN', 'LIBRARIAN'), asyncHandler(LoanController.returnLoan));
router.post('/:id/renew', asyncHandler(LoanController.renew));
router.post('/:id/lost', authorize('ADMIN', 'LIBRARIAN'), validate({ body: reportLostSchema }), asyncHandler(LoanController.reportLost));

export const loanRoutes = router;
