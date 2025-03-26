import express from "express";
// import compression from "compression";
import expressStaticGzip from "express-static-gzip";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();

// const app = express( );

const PORT = process.env.PORT;
const __dirname = path.resolve();

//使用express.json()中间件，解析请求体中的json数据
app.use(express.json({ limit: "5mb" }));

app.use(cookieParser());

// app.use(compression());
if (process.env.NODE_ENV === "production") {
  // 使用 express-static-gzip 中间件处理预压缩文件
  app.use(
    "/",
    expressStaticGzip(path.join(__dirname, "../frontend/dist"), {
      enableBrotli: true,
      orderPreference: ["br"], // 优先使用 Brotli 压缩
      serveStatic: {
        maxAge: "7 days", // 开启强缓存 7 天
      },
    })
  );

  // 处理所有其他请求，返回 index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 当有人访问以 '/api/auth' 开头的网址时，使用 authRoutes 中定义的规则处理
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// 当应用程序在生产环境中运行时（NODE_ENV 为 "production"），
if (process.env.NODE_ENV === "production") {
  // Express.js 会使用中间件提供 ../frontend/dist 目录中的静态文件。
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // 这个路由处理器会匹配所有的 GET 请求（* 表示所有路径）。
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
// 在 5001 端口启动服务器
server.listen(PORT, () => {
  console.log("server is running on port:" + PORT);
  connectDB();
});
//服务器已经启动后，不再接受新的配置。app.use() 必须在 app.listen() 之前。
