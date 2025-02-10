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
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "用户不存在" });
    }
    const isPassWordCorrect = await bcrypt.compare(password, user.password);
    if (!isPassWordCorrect) {
      return res.status(400).json({ message: "密码错误" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller:" + error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const logout = (req, res) => {
  try {
    // 清除cookie
    // 参数解释：
    // "jwt": cookie 的名称
    // "": 将 cookie 值设置为空字符串
    // { maxAge: 0 }: 配置对象
    // maxAge: 0 立即使 cookie 过期
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:" + error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "请设置头像" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile: uploadResponse.secure_url }, //上传文件的安全 URL，即使用 HTTPS 协议的文件访问地址。
      { new: true } //new: true 表示返回更新后的文档
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller:" + error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(400).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller:" + error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
