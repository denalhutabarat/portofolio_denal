import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
  main: resolve(__dirname, 'index.html'),
  donate: resolve(__dirname, 'donate.html'),
  store: resolve(__dirname, 'store.html'),
  games: resolve(__dirname, 'games.html'), // Tambahkan baris ini
},
    },
  },
})