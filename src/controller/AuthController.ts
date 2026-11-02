import {Express, Request, Response} from "express";
import {IUserLogin} from "../model/User";
import {UserService} from "../service/UserService";
import {generateToken} from "../auth";

export class AuthController {
    static init(app: Express) {
        app.post('/login/', AuthController.login);
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

        const user = await UserService.getByUsername(data.username);
        if (!user) {
            res.status(500).json({error: 'User lookup failed'});
            return;
        }

        const payload = {userId: user.id, username: data.username};
        res.json({
            token: generateToken(payload),
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    }
}
