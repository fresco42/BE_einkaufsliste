import {Express, Request, Response} from "express";
import {DB} from "../db";
import {IList, IListData, IUpdateList} from "../model/List";
import {ResultSetHeader} from "mysql2";

export class ListController {
    static init(app: Express) {
        // Create new list
        app.post("/lists", this.createList);

        // Get all lists for a user
        app.get("/lists/user/:userId", this.getListsByUserId);

        // Get list by ID
        app.get("/lists/:id", this.getListById);

        // Update list (rename)
        app.put("/lists/:id", this.updateList);

        // Delete list
        app.delete("/lists/:id", this.deleteList);
    }

    private static async createList(req: Request, res: Response) {
        try {
            const list: IList = req.body;

            if (!list.name || !list.user_id) {
                return res.status(400).json({error: "Name and user_id are required"});
            }

            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO lists (name, user_id) VALUES (?, ?)",
                [list.name, list.user_id]
            );

            res.status(201).json({
                id: result.insertId,
                name: list.name,
                user_id: list.user_id,
                message: "List created successfully"
            });
        } catch (error) {
            res.status(500).json({error: "Failed to create list"});
        }
    }

    private static async getListsByUserId(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            const [lists] = await DB.query<IListData[]>(
                "SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC",
                [userId]
            );

            res.json(lists);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch lists"});
        }
    }

    private static async getListById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [lists] = await DB.query<IListData[]>(
                "SELECT * FROM lists WHERE id = ?",
                [id]
            );

            if (lists.length === 0) {
                return res.status(404).json({error: "List not found"});
            }

            res.json(lists[0]);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch list"});
        }
    }

    private static async updateList(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const updateData: IUpdateList = req.body;

            if (!updateData.name) {
                return res.status(400).json({error: "Name is required"});
            }

            const [result] = await DB.query<ResultSetHeader>(
                "UPDATE lists SET name = ? WHERE id = ?",
                [updateData.name, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({error: "List not found"});
            }

            res.json({message: "List updated successfully"});
        } catch (error) {
            res.status(500).json({error: "Failed to update list"});
        }
    }

    private static async deleteList(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [result] = await DB.query<ResultSetHeader>(
                "DELETE FROM lists WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({error: "List not found"});
            }

            res.json({message: "List deleted successfully"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete list"});
        }
    }
}
