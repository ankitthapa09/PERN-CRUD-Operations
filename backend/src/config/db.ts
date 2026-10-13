import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Task } from "../models/Task";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  entities: [Task],
  synchronize: true, // auto-creates tables
});