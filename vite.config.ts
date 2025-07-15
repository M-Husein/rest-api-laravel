import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';
// import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		laravel({
			input: [
        'resources/css/app.scss', 
        // 'resources/js/app.js'
        'resources/ts/main.tsx'
      ],
			refresh: true,
		}),
    react(),
		// tailwindcss(),
	],
  resolve: {
    alias: {
      '@': '/resources/ts',
    },
  },
  server: {
    // port: 5175,
    // host: true,
    host: '127.0.0.1', // ✅ Force IPv4
    hmr: {
      host: 'localhost', // ✅ Prevent [::] fallback
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true,
        arrows: true,       // Converts functions to arrow functions
        comparisons: true,  // Optimizes `typeof` checks, if false will Disables '==' optimization
        conditionals: true, // Flattens nested ternaries
        toplevel: true,     // Minifies top-level functions
      },
      format: {
        comments: false, // Removes comments
      },
    },
    // reportCompressedSize: false, // For fast build
  },
});
