import {RowDataPacket} from "mysql2";

// Für neues Item (Input)
export interface IItem {
    name: string;
    quantity: number;
    list_id: number;
}

// Für DB-Abfragen (Output)
export interface IItemData extends RowDataPacket {
    id: number;
    name: string;
    quantity: number;
    checked: boolean;
    list_id: number;
    created_at: Date;
}

// Für Update (Name, Menge, Checked-Status)
export interface IUpdateItem {
    name?: string;
    quantity?: number;
    checked?: boolean;
}