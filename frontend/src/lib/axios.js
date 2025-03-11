import axios from "axios";
// 创建一个 自定义的 Axios 实例
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true, // 带上cookies等认证信息
});
