import { defineConfig } from 'vite';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
export default defineConfig({base: process.env.GITHUB_PAGES === 'true' && repo ? '/' + repo + '/' : '/'});
