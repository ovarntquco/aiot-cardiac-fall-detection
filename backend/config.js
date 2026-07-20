import express from 'express';
import cors from 'cors';
import authRoutes from './components/auth/authRoutes.js'

const app = express();

app.use(cors({
    origin?: "http://localhost:5173" | "http://localhost:8000",
    credentials: true,
    methods: ["GET", "POST", "PUT"]
}))

app.use("/auth", authRoutes)


