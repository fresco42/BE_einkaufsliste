import {loadEnvFile} from "node:process";
loadEnvFile();

import express from "express";
import cors from "cors";
import {UserController} from "./controller/UserController";
import {ListController} from "./controller/ListController";
import {ItemController} from "./controller/ItemController";

const app = express();

app.use(express.json());
app.use(cors());

// Root Route - API Info
app.get("/", (req, res) => {
    res.json({
        message: "Shopping List API",
        version: "1.0.0",
        endpoints: {
            users: {
                "POST /users": "Register new user",
                "POST /users/login": "Login user",
                "GET /users": "Get all users",
                "GET /users/:id": "Get user by ID",
                "DELETE /users/:id": "Delete user"
            },
            lists: {
                "POST /lists": "Create new list",
                "GET /lists/user/:userId": "Get all lists for user",
                "GET /lists/:id": "Get list by ID",
                "PUT /lists/:id": "Update list name",
                "DELETE /lists/:id": "Delete list"
            },
            items: {
                "POST /items": "Create new item",
                "GET /items/list/:listId": "Get all items for list",
                "GET /items/:id": "Get item by ID",
                "PUT /items/:id": "Update item",
                "DELETE /items/:id": "Delete item"
            }
        }
    });
});

// Controller initialisieren
UserController.init(app);
ListController.init(app);
ItemController.init(app);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
