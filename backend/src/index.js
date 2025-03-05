import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { app,server } from "./lib/socket.js";

dotenv.config();

// const app = express( );

const PORT = process.env.PORT;

//使用express.json()中间件，解析请求体中的json数据
app.use(express.json({ limit: "5mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 当有人访问以 '/api/auth' 开头的网址时，使用 authRoutes 中定义的规则处理
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// 在 5001 端口启动服务器
server.listen(PORT, () => {
  console.log("server is running on port:" + PORT);
  connectDB();
});
//服务器已经启动后，不再接受新的配置。app.use() 必须在 app.listen() 之前。
