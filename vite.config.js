import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
     allowedHosts: [
      "e701-2402-3a80-193f-5908-3944-da4f-56fc-2cfa.ngrok-free.app"
    ]
  }
})
