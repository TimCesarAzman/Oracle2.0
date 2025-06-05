import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    [react()],
    VitePWA({
      manifest: {
        name: 'Mystic Oracle',
        short_name: 'Oracle',
        description: 'Ask the Oracle your questions and reveal your path.',
        theme_color: '#dbb24a',
        background_color: '#321354',
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      registerType: 'autoUpdate',
      devOptions: { enabled: true }
    })
  ]
});

