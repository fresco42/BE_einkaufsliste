import {DB} from "../db";
import {IList, IListData, IUpdateList} from "../model/List";
import {ResultSetHeader} from "mysql2";

export class ListService {
    static async create(list: IList): Promise<{status: 'created', id: number} | {status: 'error'}> {
        try {
            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO lists (name, user_id) VALUES (?, ?)",
                [list.name, list.user_id]
            );

            return {status: 'created', id: result.insertId};
        } catch {
            return {status: 'error'};
        }
    }

    static async getByUserId(userId: number): Promise<IListData[]> {
        try {
            const [lists] = await DB.query<IListData[]>(
                "SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC",
                [userId]
            );

            return lists;
        } catch {
            return [];
        }
    }

    static async getById(id: number): Promise<IListData | undefined> {
        try {
            const [lists] = await DB.query<IListData[]>(
                "SELECT * FROM lists WHERE id = ?",
                [id]
            );

            return lists[0];
        } catch {
            return undefined;
        }
    }

    static async update(id: number, data: IUpdateList): Promise<'notFound' | 'updated' | 'error'> {
        try {
            const [result] = await DB.query<ResultSetHeader>(
                "UPDATE lists SET name = ? WHERE id = ?",
                [data.name, id]
            );

            if (result.affectedRows === 0) {
                return 'notFound';
            }

            return 'updated';
        } catch {
            return 'error';
        }
    }

    static async delete(id: number): Promise<'notFound' | 'deleted' | 'error'> {
        try {
            const [result] = await DB.query<ResultSetHeader>(
                "DELETE FROM lists WHERE id = ?",
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
}
