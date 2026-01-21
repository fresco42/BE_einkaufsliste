import mysql, {Pool} from 'mysql2/promise';

let pool: Pool | null = null;

export const DB = {
    query<T>(sql: string, values?: unknown[]): Promise<[T, mysql.FieldPacket[]]> {
        if (!pool) {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT!),
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });
        }
        return pool.query<T & mysql.RowDataPacket[]>(sql, values);
    }
};
