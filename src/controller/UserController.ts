import {Express, Request, Response} from "express";
import {DB} from "../db";
import {IUser, IUserData} from "../model/User";
import {ResultSetHeader} from "mysql2";

export class UserController {
    static init(app: Express) {
        // Create new user (Register)
        app.post("/users", this.createUser);

        // Login user
        app.post("/users/login", this.loginUser);

        // Get user by ID
        app.get("/users/:id", this.getUserById);

        // Get all users
        app.get("/users", this.getAllUsers);

        // Delete user
        app.delete("/users/:id", this.deleteUser);
    }

    private static async createUser(req: Request, res: Response) {
        try {
            const user: IUser = req.body;

            if (!user.username || !user.password) {
                return res.status(400).json({error: "Username and password are required"});
            }

            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [user.username, user.password]
            );

            res.status(201).json({
                id: result.insertId,
                username: user.username,
                message: "User created successfully"
            });
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({error: "Username already exists"});
            } else {
                res.status(500).json({error: "Failed to create user"});
            }
        }
    }

    private static async loginUser(req: Request, res: Response) {
        try {
            const {username, password}: IUser = req.body;

            if (!username || !password) {
                return res.status(400).json({error: "Username and password are required"});
            }

            const [users] = await DB.query<IUserData[]>(
                "SELECT * FROM users WHERE username = ? AND password = ?",
                [username, password]
            );

            if (users.length === 0) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const user = users[0];
            res.json({
                id: user.id,
                username: user.username,
                created_at: user.created_at
            });
        } catch (error) {
            res.status(500).json({error: "Login failed"});
        }
    }

    private static async getUserById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [users] = await DB.query<IUserData[]>(
                "SELECT * FROM users WHERE id = ?",
                [id]
            );

            if (users.length === 0) {
                return res.status(404).json({error: "User not found"});
            }

            const user = users[0];
            res.json({
                id: user.id,
                username: user.username,
                created_at: user.created_at
            });
        } catch (error) {
            res.status(500).json({error: "Failed to fetch user"});
        }
    }

    private static async getAllUsers(req: Request, res: Response) {
        try {
            const [users] = await DB.query<IUserData[]>("SELECT * FROM users");

            const usersWithoutPassword = users.map(user => ({
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }));

            res.json(usersWithoutPassword);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }

    private static async deleteUser(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [result] = await DB.query<ResultSetHeader>(
                "DELETE FROM users WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({error: "User not found"});
            }

            res.json({message: "User deleted successfully"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete user"});
        }
    }
}