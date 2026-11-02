import {RowDataPacket} from "mysql2";

// Für neue User (Input)
export interface IUser {
    username: string;
    password: string;
}

// Für DB-Abfragen (Output)
export interface IUserData extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    created_at: Date;
}

// Für Login
export interface IUserLogin {
    username: string;
    password: string;
}

// Für Passwort-Abfragen
export interface IUserPassword extends RowDataPacket {
    password: string;
}