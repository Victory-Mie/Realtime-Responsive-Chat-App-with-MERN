import express from "express";
import { signup, logout, login } from "../controllers/auth.controller.js";
const router = express.Router();

// 路由处理器
// req 包含访问者的信息
// res 用来回应访问者

router.post("/signup", signup);
router.post("/login", logout);
router.post("/logout", login);

export default router;
