import {Express, Request, Response} from "express";
import {DB} from "../db";
import {IItem, IItemData, IUpdateItem} from "../model/Item";
import {ResultSetHeader} from "mysql2";
import {validateAuth} from "../middleware/auth";

export class ItemController {
    static init(app: Express) {
        /**
         * @swagger
         * /items:
         *   post:
         *     summary: Neues Item erstellen
         *     tags: [Items]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ItemInput'
         *     responses:
         *       201:
         *         description: Item erfolgreich erstellt
         *       400:
         *         description: Name und list_id erforderlich
         *       401:
         *         description: Nicht autorisiert
         *       500:
         *         description: Server Error
         */
        app.post("/items", validateAuth, this.createItem);

        /**
         * @swagger
         * /items/list/{listId}:
         *   get:
         *     summary: Alle Items einer Liste abrufen
         *     tags: [Items]
         *     parameters:
         *       - in: path
         *         name: listId
         *         required: true
         *         schema:
         *           type: integer
         *         description: Liste ID
         *     responses:
         *       200:
         *         description: Items der Liste
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Item'
         *       500:
         *         description: Server Error
         */
        app.get("/items/list/:listId", this.getItemsByListId);

        /**
         * @swagger
         * /items/{id}:
         *   get:
         *     summary: Item by ID abrufen
         *     tags: [Items]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: Item ID
         *     responses:
         *       200:
         *         description: Item gefunden
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Item'
         *       404:
         *         description: Item nicht gefunden
         *       500:
         *         description: Server Error
         */
        app.get("/items/:id", this.getItemById);

        /**
         * @swagger
         * /items/{id}:
         *   put:
         *     summary: Item aktualisieren
         *     tags: [Items]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: Item ID
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ItemUpdate'
         *     responses:
         *       200:
         *         description: Item erfolgreich aktualisiert
         *       400:
         *         description: Keine Felder zum Aktualisieren
         *       401:
         *         description: Nicht autorisiert
         *       404:
         *         description: Item nicht gefunden
         *       500:
         *         description: Server Error
         */
        app.put("/items/:id", validateAuth, this.updateItem);

        /**
         * @swagger
         * /items/{id}:
         *   delete:
         *     summary: Item löschen
         *     tags: [Items]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: Item ID
         *     responses:
         *       200:
         *         description: Item erfolgreich gelöscht
         *       401:
         *         description: Nicht autorisiert
         *       404:
         *         description: Item nicht gefunden
         *       500:
         *         description: Server Error
         */
        app.delete("/items/:id", validateAuth, this.deleteItem);
    }

    private static async createItem(req: Request, res: Response) {
        try {
            const item: IItem = req.body;

            if (!item.name || !item.list_id) {
                return res.status(400).json({error: "Name and list_id are required"});
            }

            if (item.quantity === undefined || item.quantity === null) {
                item.quantity = 1;
            }

            const [result] = await DB.query<ResultSetHeader>(
                "INSERT INTO items (name, quantity, list_id) VALUES (?, ?, ?)",
                [item.name, item.quantity, item.list_id]
            );

            res.status(201).json({
                id: result.insertId,
                name: item.name,
                quantity: item.quantity,
                list_id: item.list_id,
                checked: false,
                message: "Item created successfully"
            });
        } catch (error) {
            res.status(500).json({error: "Failed to create item"});
        }
    }

    private static async getItemsByListId(req: Request, res: Response) {
        try {
            const listId = parseInt(req.params.listId);

            const [items] = await DB.query<IItemData[]>(
                "SELECT * FROM items WHERE list_id = ? ORDER BY created_at DESC",
                [listId]
            );

            res.json(items);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch items"});
        }
    }

    private static async getItemById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [items] = await DB.query<IItemData[]>(
                "SELECT * FROM items WHERE id = ?",
                [id]
            );

            if (items.length === 0) {
                return res.status(404).json({error: "Item not found"});
            }

            res.json(items[0]);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch item"});
        }
    }

    private static async updateItem(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const updateData: IUpdateItem = req.body;

            const updates: string[] = [];
            const values: (string | number | boolean)[] = [];

            if (updateData.name !== undefined) {
                updates.push("name = ?");
                values.push(updateData.name);
            }

            if (updateData.quantity !== undefined) {
                updates.push("quantity = ?");
                values.push(updateData.quantity);
            }

            if (updateData.checked !== undefined) {
                updates.push("checked = ?");
                values.push(updateData.checked);
            }

            if (updates.length === 0) {
                return res.status(400).json({error: "No fields to update"});
            }

            values.push(id);

            const [result] = await DB.query<ResultSetHeader>(
                `UPDATE items SET ${updates.join(", ")} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({error: "Item not found"});
            }

            res.json({message: "Item updated successfully"});
        } catch (error) {
            res.status(500).json({error: "Failed to update item"});
        }
    }

    private static async deleteItem(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const [result] = await DB.query<ResultSetHeader>(
                "DELETE FROM items WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({error: "Item not found"});
            }

            res.json({message: "Item deleted successfully"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete item"});
        }
    }
}
