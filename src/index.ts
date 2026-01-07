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

// Controller initialisieren
UserController.init(app);
ListController.init(app);
ItemController.init(app);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
