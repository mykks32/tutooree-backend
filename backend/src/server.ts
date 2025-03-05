import express from 'express';
import connectDB from './bootstrap/database';
import baseRouter from './routes';

const getApp  = async () => {
    const app = express();

    await connectDB();

    app.use("/api", baseRouter());

    return app;
}

export default getApp;