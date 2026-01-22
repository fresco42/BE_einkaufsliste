import {Express, Request, Response} from "express";
import {IList, IUpdateList} from "../model/List";
import {ListService} from "../service/ListService";
import {validateAuth} from "../auth";

export class ListController {
    static init(app: Express) {
        app.post("/lists", validateAuth, this.createList);
        app.get("/lists/user/:userId", this.getListsByUserId);
        app.get("/lists/:id", this.getListById);
        app.put("/lists/:id", validateAuth, this.updateList);
        app.delete("/lists/:id", validateAuth, this.deleteList);
    }

    private static async createList(req: Request, res: Response) {
        const list: IList = req.body;

        if (!list.name || !list.user_id) {
            res.status(400).json({error: "Name and user_id are required"});
            return;
        }

        const result = await ListService.create(list);

        if (result.status === 'created') {
            res.status(201).json({
                id: result.id,
                name: list.name,
                user_id: list.user_id,
                message: "List created successfully"
            });
            return;
        }

        res.status(500).json({error: "Failed to create list"});
    }

    private static async getListsByUserId(req: Request, res: Response) {
        const userId = parseInt(req.params.userId);

        const lists = await ListService.getByUserId(userId);

        res.json(lists);
    }

    private static async getListById(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        const list = await ListService.getById(id);

        if (!list) {
            res.status(404).json({error: "List not found"});
            return;
        }

        res.json(list);
    }

    private static async updateList(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const updateData: IUpdateList = req.body;

        if (!updateData.name) {
            res.status(400).json({error: "Name is required"});
            return;
        }

        const result = await ListService.update(id, updateData);

        switch (result) {
            case 'updated':
                res.json({message: "List updated successfully"});
                return;
            case 'notFound':
                res.status(404).json({error: "List not found"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to update list"});
                return;
        }
    }

    private static async deleteList(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        const result = await ListService.delete(id);

        switch (result) {
            case 'deleted':
                res.json({message: "List deleted successfully"});
                return;
            case 'notFound':
                res.status(404).json({error: "List not found"});
                return;
            case 'error':
                res.status(500).json({error: "Failed to delete list"});
                return;
        }
    }
}
