import {DB} from "../db";
import {IUser, IUserData, IUserLogin, IUserPassword} from "../model/User";
import {ResultSetHeader} from "mysql2";
import bcrypt from "bcrypt";

export class UserService {
    static async create(user: IUser): Promise<'conflict' | 'created' | 'error'> {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await DB.query<ResultSetHeader>(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [user.username, hashedPassword]
            );

            return 'created';
        } catch (error: unknown) {
            if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
                return 'conflict';
            }
            return 'error';
        }
    }

    static async getById(id: number): Promise<IUserData | undefined> {
        try {
            const [users] = await DB.query<IUserData[]>(
                "SELECT * FROM users WHERE id = ?",
                [id]
            );

            return users[0];
        } catch {
            return undefined;
        }
    }

    static async getAll(): Promise<IUserData[]> {
        try {
            const [users] = await DB.query<IUserData[]>("SELECT * FROM users");
            return users;
        } catch {
            return [];
        }
    }

    static async delete(id: number): Promise<'notFound' | 'deleted' | 'error'> {
        try {
            const [result] = await DB.query<ResultSetHeader>(
                "DELETE FROM users WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return 'notFound';
            }

            return 'deleted';
        } catch {
            return 'error';
        }
    }

    static async validatePassword(login: IUserLogin): Promise<boolean> {
        try {
            const [users] = await DB.query<IUserPassword[]>(
                "SELECT password FROM users WHERE username = ?",
                [login.username]
            );

            if (users.length === 0) {
                return false;
            }

            return await bcrypt.compare(login.password, users[0].password);
        } catch {
            return false;
        }
    }

    static async getByUsername(username: string): Promise<IUserData | undefined> {
        try {
            const [users] = await DB.query<IUserData[]>(
                "SELECT * FROM users WHERE username = ?",
                [username]
            );

            return users[0];
        } catch {
            return undefined;
        }
    }
}
