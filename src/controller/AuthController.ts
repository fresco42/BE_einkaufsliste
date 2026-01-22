import {Express, Request, Response} from "express";
import {IUserLogin} from "../model/User";
import {UserService} from "../service/UserService";
import {generateToken} from "../auth";

export class AuthController {
    static init(app: Express) {
        app.post('/login', AuthController.login);
    }

    private static async login(req: Request, res: Response) {
        const data = req.body as IUserLogin;

        if (!data || !data.username || !data.password) {
            res.status(400).json({message: 'Missing fields'});
            return;
        }

        const result = await UserService.validatePassword(data);

        if (!result) {
            res.status(401).json({error: 'Invalid credentials'});
            return;
        }

        const payload = {username: data.username};
        res.json({token: generateToken(payload)});
    }
}
