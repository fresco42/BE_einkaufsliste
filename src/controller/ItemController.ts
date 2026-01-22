import {Express, Request, Response} from "express";
import {IItem, IUpdateItem} from "../model/Item";
import {ItemService} from "../service/ItemService";
import {validateAuth} from "../auth";

export class ItemController {
    static init(app: Express) {
        app.post("/items", validateAuth, this.createItem);
        app.get("/items/list/:listId", this.getItemsByListId);
        app.get("/items/:id", this.getItemById);
        app.put("/items/:id", validateAuth, this.updateItem);
        app.delete("/items/:id", validateAuth, this.deleteItem);
    }

    private static async createItem(req: Request, res: Response) {
        const item: IItem = req.body;

        if (!item.name || !item.list_id) {
            res.status(400).json({error: "Name and list_id are required"});
            return;
        }

        const result = await ItemService.create(item);

        if (result.status === 'created') {
            res.status(201).json({
                id: result.id,
                name: item.name,
                quantity: item.quantity ?? 1,
                list_id: item.list_id,
                checked: false,
                message: "Item created successfully"
            });
            return;
        }

        res.status(500).json({error: "Failed to create item"});
    }

    private static async getItemsByListId(req: Request, res: Response) {
        const listId = parseInt(req.params.listId);

        const items = await ItemService.getByListId(listId);

        res.json(items);
    }

    private static async getItemById(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        const item = await ItemService.getById(id);

        if (!item) {
            res.status(404).json({error: "Item not found"});
            return;
        }

        res.json(item);
    }

    private static async updateItem(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const updateData: IUpdateItem = req.body;

        if (updateData.name === undefined && updateData.quantity === undefined && updateData.checked === undefined) {
            res.status(400).json({error: "No fields to update"});
            return;
        }

        const result = await ItemService.update(id, updateData);

        switch (result) {
            case 'updated':
                res.json({message: "Item updated successfully"});
                return;
            case 'notFound':
                res.status(404).json({error: "Item not found"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to update item"});
                return;
        }
    }

    private static async deleteItem(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        const result = await ItemService.delete(id);

        switch (result) {
            case 'deleted':
                res.json({message: "Item deleted successfully"});
                return;
            case 'notFound':
                res.status(404).json({error: "Item not found"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to delete item"});
                return;
        }
    }
}
