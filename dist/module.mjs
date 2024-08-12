import { defineNuxtModule, createResolver, addPlugin, extendViteConfig, addImportsDir, addTemplate } from '@nuxt/kit';
import { fileURLToPath } from 'url';
import { defu } from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-medusa",
    configKey: "medusa"
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.private = defu(nuxt.options.runtimeConfig.private, {
      apiKey: options.apiKey
    });
    nuxt.options.runtimeConfig.public.medusa = defu(nuxt.options.runtimeConfig.public.medusa, {
      baseUrl: process.env.MEDUSA_URL || options.baseUrl,
      publishableKey: options.publishableKey,
      global: options.global
    });
    if (options.global)
      addPlugin(resolver.resolve("./runtime/plugin"));
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.build.transpile.push("@medusajs/medusa-js");
    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {};
      config.optimizeDeps.include = config.optimizeDeps.include || [];
      config.optimizeDeps.include.push("@medusajs/medusa-js", "axios");
    });
    addImportsDir(resolver.resolve(runtimeDir, "composables"));
    if (options.server) {
      nuxt.hook("nitro:config", (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {};
        nitroConfig.externals = defu(typeof nitroConfig.externals === "object" ? nitroConfig.externals : {}, {
          inline: [resolver.resolve("./runtime")]
        });
        nitroConfig.alias["#medusa/server"] = resolver.resolve(runtimeDir, "./server/services");
      });
    }
    addTemplate({
      filename: "types/medusa.d.ts",
      getContents: () => [
        "declare module '#medusa/server' {",
        `  const serverMedusaClient: typeof import('${resolver.resolve("./runtime/server/services")}').serverMedusaClient`,
        "}"
      ].join("\n")
    });
    nuxt.hook("prepare:types", (options2) => {
      options2.references.push({ path: resolver.resolve(nuxt.options.buildDir, "types/medusa.d.ts") });
    });
  }
});

export { module as default };
