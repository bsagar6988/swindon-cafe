import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { menuRouter } from "./routes/menu";
import { ordersRouter } from "./routes/orders";
import { deliveriesRouter } from "./routes/deliveries";
import { addressesRouter } from "./routes/addresses";
import { ridersRouter } from "./routes/riders";
import { initRealtime } from "./realtime";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/menu", menuRouter);
app.use("/orders", ordersRouter);
app.use("/deliveries", deliveriesRouter);
app.use("/addresses", addressesRouter);
app.use("/riders", ridersRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
initRealtime(server);

const PORT = Number(process.env.PORT ?? 4000);
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
