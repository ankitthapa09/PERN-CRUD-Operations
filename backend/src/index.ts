import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  await AppDataSource.initialize();

  app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exitCode = 1;
});
