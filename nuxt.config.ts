// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/global.scss" as *;',
        },
      },
    },
  },
  css: ["@/assets/scss/base.scss"],
  // serverMiddleware: [
  //   { path: '/api/swap-topics', handler: '~/middleware/swapTopics.js' },
  // ],
  build: {
    cssSourceMap: false,
    loaders: {
      scss: {
        sassOptions: {
          quietDeps: true,
        },
      },
    },
  },
  supabase: {
    redirectOptions: {
      exclude: ["*"],
    },
  },
});
