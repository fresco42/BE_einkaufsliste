import {RowDataPacket} from "mysql2";

// Für neue Liste (Input)
export interface IList {
    name: string;
    user_id: number;
}

// Für DB-Abfragen (Output)
export interface IListData extends RowDataPacket {
    id: number;
    name: string;
    user_id: number;
    created_at: Date;
}

// Für Update (nur Name änderbar)
export interface IUpdateList {
    name: string;
}
