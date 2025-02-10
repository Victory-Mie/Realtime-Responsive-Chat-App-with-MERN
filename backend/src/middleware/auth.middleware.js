import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
// 中间件是一个函数，它可以访问请求对象(req)、响应对象(res)和应用程序请求-响应周期中的下一个中间件函数(next)。它可以：
// 执行任何代码
// 修改请求和响应对象
// 结束请求-响应周期
// 调用堆栈中的下一个中间件
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "无权限" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "无权限" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    req.user = user;
    next();
    //只有在验证通过后才调用 next() 将控制权传递给下一个中间件或路由处理函数，确保未经授权的请求不会继续处理。
  } catch (error) {
    console.log("Error in protectRouter middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
