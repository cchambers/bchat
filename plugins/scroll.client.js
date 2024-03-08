export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp();

  nuxtApp.hooks.hook("page:transition:finish", async () => {
    document.body.scrollTo({ top: 9 });
  });
});
