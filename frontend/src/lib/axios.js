import axios from "axios";
// 创建一个 自定义的 Axios 实例
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // 带上cookies等认证信息
});
