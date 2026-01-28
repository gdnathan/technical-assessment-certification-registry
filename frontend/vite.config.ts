import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


import fs from 'fs';

// Debug au build
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('public exists:', fs.existsSync('/app/public'));
console.log('public contents:', fs.readdirSync('/app/public/contracts'));

// https://vitejs.dev/config/
export default ({ mode }: { mode: string; }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    server: {
      open: '/app',
      host: true,
    },
    publicDir: 'public',
  });
};
