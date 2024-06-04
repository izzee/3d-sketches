// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        test: 'test.html'
      }
    }
  }
}