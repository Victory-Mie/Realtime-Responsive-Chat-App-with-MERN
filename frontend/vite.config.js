import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true, // 打包完成后自动打开分析页面
      gzipSize: true, // 显示 gzip 压缩后的大小
      brotliSize: true, // 显示 brotli 压缩后的大小
    }),
    viteCompression({
      verbose: true, // 显示压缩信息
      disable: false, // 是否禁用压缩
      threshold: 10240, // 只有大小大于该值的文件才会被压缩（单位：字节）
      algorithm: "gzip", // 压缩算法，可选值：'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw'
      ext: ".gz", // 压缩文件的扩展名
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "brotliCompress", // 生成 Brotli
      ext: ".br",
    }),
  ],
});
