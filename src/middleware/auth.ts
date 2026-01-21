import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: number;
}

export interface JwtPayload {
    userId: number;
}

export function validateAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({error: "No token provided"});
        return;
    }

    const token = authHeader.substring(7);

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({error: "JWT secret not configured"});
            return;
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({error: "Invalid token"});
    }
}