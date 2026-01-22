import {DB} from "../db";
import {IItem, IItemData, IUpdateItem} from "../model/Item";
import {ResultSetHeader} from "mysql2";

export class ItemService {
    static async create(item: IItem): Promise<{status: 'created', id: number} | {status: 'error'}> {
        try {
            const quantity = item.quantity ?? 1;

            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO items (name, quantity, list_id) VALUES (?, ?, ?)",
                [item.name, quantity, item.list_id]
            );

            return {status: 'created', id: result.insertId};
        } catch {
            return {status: 'error'};
        }
    }

    static async getByListId(listId: number): Promise<IItemData[]> {
        try {
            const [items] = await DB.query<IItemData[]>(
                "SELECT * FROM items WHERE list_id = ? ORDER BY created_at DESC",
                [listId]
            );

            return items;
        } catch {
            return [];
        }
    }

    static async getById(id: number): Promise<IItemData | undefined> {
        try {
            const [items] = await DB.query<IItemData[]>(
                "SELECT * FROM items WHERE id = ?",
                [id]
            );

            return items[0];
        } catch {
            return undefined;
        }
    }

    static async update(id: number, data: IUpdateItem): Promise<'notFound' | 'updated' | 'error'> {
        try {
            const updates: string[] = [];
            const values: (string | number | boolean)[] = [];

            if (data.name !== undefined) {
                updates.push("name = ?");
                values.push(data.name);
            }

            if (data.quantity !== undefined) {
                updates.push("quantity = ?");
                values.push(data.quantity);
            }

            if (data.checked !== undefined) {
                updates.push("checked = ?");
                values.push(data.checked);
            }

            if (updates.length === 0) {
                return 'notFound';
            }

            values.push(id);

            const [result] = await DB.query<ResultSetHeader>(
                `UPDATE items SET ${updates.join(", ")} WHERE id = ?`,
                values
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
                "DELETE FROM items WHERE id = ?",
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
