import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Radian Key',
        short_name: 'RadianKey',
        description: 'Loyalty card app for Radian Studio',
        theme_color: '#4f46e5',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '..', '192.168.1.13+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '..', '192.168.1.13+3.pem'))
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        secure: false,
        changeOrigin: true
      }
    }
  }
})
