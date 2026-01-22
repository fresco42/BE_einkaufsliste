import jwt from 'jsonwebtoken';
import {NextFunction,Request, Response} from "express";

interface ITokenPayload {
    username: string;
}

export function generateToken(payload: ITokenPayload){
    return jwt.sign(payload, process.env.JWT_SECRET!)
}

export function validateAuth(req: Request, res: Response, next: NextFunction) {
    try{
        const header = (req.headers.authorization ?? '').trim();
        if(!header.startsWith('Bearer ')){
            res.status(401).send('Not authorized');
            return;
        }
        const token = header.substring('Bearer '.length).trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;
        req.params._username = decoded.username;
        next();
    } catch{
        res.status(401).send('Not authorized');
    }
}