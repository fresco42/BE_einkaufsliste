import {loadEnvFile} from "node:process";
loadEnvFile();

import express from "express";
import cors from "cors";
import {UserController} from "./controller/UserController";
import {ListController} from "./controller/ListController";
import {ItemController} from "./controller/ItemController";
import {AuthController} from "./controller/AuthController";

const app = express();

app.use(express.json());
app.use(cors());

AuthController.init(app);
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