import {Express, Request, Response} from "express";
import {DB} from "../db";
import {IUser, IUserData} from "../model/User";
import {ResultSetHeader} from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserController {
    static init(app: Express) {
        /**
         * @swagger
         * /users:
         *   post:
         *     summary: Neuen User registrieren
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/UserInput'
         *     responses:
         *       201:
         *         description: User erfolgreich erstellt
         *       400:
         *         description: Username und Passwort erforderlich
         *       409:
         *         description: Username existiert bereits
         *       500:
         *         description: Server Error
         */
        app.post("/users", this.createUser);

        /**
         * @swagger
         * /users/login:
         *   post:
         *     summary: User einloggen
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/UserInput'
         *     responses:
         *       200:
         *         description: Login erfolgreich, gibt User-Daten und JWT Token zurück
         *       400:
         *         description: Username und Passwort erforderlich
         *       401:
         *         description: Ungültige Anmeldedaten
         *       500:
         *         description: Server Error
         */
        app.post("/users/login", this.loginUser);

        /**
         * @swagger
         * /users/{id}:
         *   get:
         *     summary: User by ID abrufen
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: User ID
         *     responses:
         *       200:
         *         description: User gefunden
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/User'
         *       404:
         *         description: User nicht gefunden
         *       500:
         *         description: Server Error
         */
        app.get("/users/:id", this.getUserById);

        /**
         * @swagger
         * /users:
         *   get:
         *     summary: Alle User abrufen
         *     tags: [Users]
         *     responses:
         *       200:
         *         description: Liste aller User
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/User'
         *       500:
         *         description: Server Error
         */
        app.get("/users", this.getAllUsers);

        /**
         * @swagger
         * /users/{id}:
         *   delete:
         *     summary: User löschen
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: User ID
         *     responses:
         *       200:
         *         description: User erfolgreich gelöscht
         *       404:
         *         description: User nicht gefunden
         *       500:
         *         description: Server Error
         */
        app.delete("/users/:id", this.deleteUser);
    }

    private static async createUser(req: Request, res: Response) {
        try {
            const user: IUser = req.body;

            if (!user.username || !user.password) {
                res.status(400).json({error: "Username and password are required"});
                return;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);

            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [user.username, hashedPassword]
            );

            res.status(201).json({
                id: result.insertId,
                username: user.username,
                message: "User created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
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
                res.status(400).json({error: "Username and password are required"});
                return;
            }

            const [users] = await DB.query<IUserData[]>(
                "SELECT * FROM users WHERE username = ?",
                [username]
            );

            if (users.length === 0) {
                res.status(401).json({error: "Invalid credentials"});
                return;
            }

            const user = users[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                res.status(401).json({error: "Invalid credentials"});
                return;
            }

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(500).json({error: "JWT secret not configured"});
                return;
            }

            const token = jwt.sign({userId: user.id}, secret, {expiresIn: "24h"});

            res.json({
                id: user.id,
                username: user.username,
                created_at: user.created_at,
                token
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