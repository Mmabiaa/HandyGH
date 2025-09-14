import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 3000, // Increased from 2000 to suppress warning
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          // Add other large dependencies as needed
          // supabase: ['@supabase/supabase-js'],
        }
      }
    }
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});