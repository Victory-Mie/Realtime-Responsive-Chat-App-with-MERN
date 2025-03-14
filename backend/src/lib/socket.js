import { Server } from "socket.io";
import http from "http";
import express from "express";

//Express 实例对象在本质上是一个符合 Node.js http 模块要求的请求处理函数
const app = express();

// http.createServer() 方法接受一个可选的回调函数作为参数，这个回调函数用于处理客户端的 HTTP 请求。
// 该回调函数有两个参数：request,response。
const server = http.createServer(app);
// PS：这里在 Express 应用中使用 const server = http.createServer(app); 这种方式而非直接使用 app.listen() ，是为了集成 WebSocket 协议

// 将这个 server 实例传递给 WebSocket.Server 来初始化 WebSocket 服务器。这样，同一个服务器就可以同时处理 HTTP 请求和 WebSocket 连接。
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {};

export function getReceiverSocketID(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  // 分发在线用户列表
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 监听断开连接时间并更新在线用户列表
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
