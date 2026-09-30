import { Request, Response } from 'express';
import { LoanService } from './loan.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';

export class LoanController {
  static async checkout(req: Request, res: Response) {
    const librarianId = req.user!.id;
    const loan = await LoanService.checkout(req.body, librarianId);
    return ApiResponse.created(res, loan, 'Loan created successfully');
  }

  static async returnLoan(req: Request, res: Response) {
    const loanId = parseInt(req.params.id, 10);
    const result = await LoanService.returnLoan(loanId);
    return ApiResponse.success(res, result, 'Book returned successfully');
  }

  static async renew(req: Request, res: Response) {
    const loanId = parseInt(req.params.id, 10);
    const result = await LoanService.renew(loanId, req.user!);
    return ApiResponse.success(res, result, 'Loan renewed successfully');
  }

  static async list(req: Request, res: Response) {
    const result = await LoanService.listLoans(req.query, req.user!);
    return ApiResponse.success(res, result);
  }

  static async getById(req: Request, res: Response) {
    const loanId = parseInt(req.params.id, 10);
    const loan = await LoanService.getById(loanId, req.user!);
    return ApiResponse.success(res, loan);
  }

  static async reportLost(req: Request, res: Response) {
    const loanId = parseInt(req.params.id, 10);
    const type = req.body.type || 'LOST';
    const fineAmount = req.body.fineAmount || 200000;
    const result = await LoanService.reportLostOrDamaged(loanId, type, fineAmount);
    return ApiResponse.success(res, result, 'Reported lost/damaged book and generated fine');
  }

  static async updateStatus(req: Request, res: Response) {
    const loanId = parseInt(req.params.id, 10);
    const result = await LoanService.changeStatus(loanId, req.body.status);
    return ApiResponse.success(res, result, 'Loan status updated successfully');
  }
}
