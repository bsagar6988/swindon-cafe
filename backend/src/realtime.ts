import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";

let io: Server | null = null;

export function initRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("subscribe:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });
    socket.on("subscribe:restaurant", () => {
      socket.join("restaurant");
    });
    socket.on("subscribe:deliveries", () => {
      socket.join("deliveries");
    });
  });

  return io;
}

export function emitOrderUpdate(orderId: string, order: unknown) {
  io?.to(`order:${orderId}`).emit("order:updated", order);
  io?.to("restaurant").emit("order:updated", order);
  io?.to("deliveries").emit("order:updated", order);
}

export function emitNewOrder(order: unknown) {
  io?.to("restaurant").emit("order:created", order);
}
