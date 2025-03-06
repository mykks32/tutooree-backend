import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
const { UNAUTHORIZED } = StatusCodes

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(UNAUTHORIZED).json({ message: 'Unauthorized' });
};