import { Router, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';

const {
    BAD_REQUEST,
    CREATED,
    OK,
    NOT_FOUND,
    UNAUTHORIZED,
    INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY
  } = StatusCodes;

const baseRouter = () => {
    const router = Router();

    router.use('/', (req: Request, res: Response) => {
        res.status(OK).json({ message: "Welcome to Tutoree API" });
    })

    router.use("*", (req: Request, res: Response) => {
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Route not found" });
    });

    return router;
};

export default baseRouter;