import {Express, Request, Response} from "express";
import {IUser} from "../model/User";
import {UserService} from "../service/UserService";
import {getAuthUserId, validateAuth} from "../auth";

export class UserController {
    static init(app: Express) {
        app.post("/users", this.createUser);
        app.get("/users/:id", validateAuth, this.getUserById);
        app.get("/users", validateAuth, this.getAllUsers);
        app.delete("/users/:id", validateAuth, this.deleteUser);
    }

    private static async createUser(req: Request, res: Response) {
        const user: IUser = req.body;

        if (!user.username || !user.password) {
            res.status(400).json({error: "Username and password are required"});
            return;
        }

        const result = await UserService.create(user);

        switch (result) {
            case 'created':
                res.status(201).json({
                    username: user.username,
                    message: "User created successfully"
                });
                return;
            case 'conflict':
                res.status(409).json({error: "Username already exists"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to create user"});
                return;
        }
    }

    private static async getUserById(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        const user = await UserService.getById(id);

        if (!user) {
            res.status(404).json({error: "User not found"});
            return;
        }

        res.json({
            id: user.id,
            username: user.username,
            created_at: user.created_at
        });
    }

    private static async getAllUsers(req: Request, res: Response) {
        const users = await UserService.getAll();

        const usersWithoutPassword = users.map(user => ({
            id: user.id,
            username: user.username,
            created_at: user.created_at
        }));

        res.json(usersWithoutPassword);
    }

    private static async deleteUser(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        if (id !== getAuthUserId(res)) {
            res.status(403).json({error: "Forbidden"});
            return;
        }

        const result = await UserService.delete(id);

        switch (result) {
            case 'deleted':
                res.json({message: "User deleted successfully"});
                return;
            case 'notFound':
                res.status(404).json({error: "User not found"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to delete user"});
                return;
        }
    }
}
