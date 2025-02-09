import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "所有信息都必填" });
    }
    // 校验密码长度
    if (password.length < 6) {
      return res.status(400).json({ message: "密码长度不能小于6位" });
    }
    //校验用户是否已存在
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "用户已存在" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      // 生成jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "非法用户信息" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = (req, res) => {
  res.send("login route");
};
export const logout = (req, res) => {
  res.send("logout route");
};
