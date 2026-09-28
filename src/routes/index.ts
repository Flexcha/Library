import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.ts';
import { userRoutes } from '../modules/user/user.routes.ts';
import { bookRoutes, copyRoutes } from '../modules/catalog/book.routes.ts';
import { authorRoutes } from '../modules/catalog/author.routes.ts';
import { categoryRoutes } from '../modules/catalog/category.routes.ts';
import { publisherRoutes } from '../modules/catalog/publisher.routes.ts';
import { loanRoutes } from '../modules/circulation/loan.routes.ts';
import { reservationRoutes } from '../modules/reservation/reservation.routes.ts';
import { fineRoutes } from '../modules/fine/fine.routes.ts';
import { notificationRoutes } from '../modules/notification/notification.routes.ts';
import { reportRoutes } from '../modules/report/report.routes.ts';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/books', bookRoutes);
apiRouter.use('/copies', copyRoutes);
apiRouter.use('/authors', authorRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/publishers', publisherRoutes);
apiRouter.use('/loans', loanRoutes);
apiRouter.use('/reservations', reservationRoutes);
apiRouter.use('/fines', fineRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);

export { apiRouter };
