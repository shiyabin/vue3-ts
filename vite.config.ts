import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import presets from './presets';

// https://vitejs.dev/config/
export default defineConfig(env => {
  // env 环境变量
  const viteEnv = loadEnv(env.mode, process.cwd());
  return {
    plugins: presets(viteEnv),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      minify: 'esbuild',
      assetsDir: 'static/assets',
      // 静态资源打包到dist下的不同目录
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    css: {
      preprocessorOptions: {
        // 全局引入了 scss 的文件
        scss: {
          javascriptEnabled: true
        }
      }
    }
  };
});
