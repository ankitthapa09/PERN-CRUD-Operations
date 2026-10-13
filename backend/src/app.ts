import express from "express";
import cors from "cors";
import { env } from "./config/env";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

export default app;