import { defineNuxtModule, addPlugin, createResolver, addImportsDir, extendViteConfig, addTemplate } from '@nuxt/kit'
import { fileURLToPath } from 'url'
import { defu } from 'defu'
import type { Config } from '@medusajs/js-sdk/dist/types'

export type ModuleOptions = Config & { global?: boolean, server: boolean }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-medusa',
    configKey: 'medusa'
  },
  defaults: {
    baseUrl: 'http://localhost:9000',
    global: true,
    server: false,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.private = defu(nuxt.options.runtimeConfig.private, {
      apiKey: options.apiKey
    })

    nuxt.options.runtimeConfig.public.medusa = defu(nuxt.options.runtimeConfig.public.medusa, {
      baseUrl: process.env.MEDUSA_URL || options.baseUrl,
      publishableKey: options.publishableKey,
      global: options.global
    })

    if (options.global) addPlugin(resolver.resolve('./runtime/plugin'))

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.build.transpile.push("@medusajs/js-sdk");

    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push('@medusajs/js-sdk', 'axios')
    })
    addImportsDir(resolver.resolve(runtimeDir, 'composables'))

    if (options.server) {
      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}

        // Inline module runtime in Nitro bundle
        nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
          inline: [resolver.resolve('./runtime')]
        })
        nitroConfig.alias['#medusa/server'] = resolver.resolve(runtimeDir, './server/services')
      })
    }

    addTemplate({
      filename: 'types/medusa.d.ts',
      getContents: () => [
        'declare module \'#medusa/server\' {',
        `  const serverMedusaClient: typeof import('${resolver.resolve('./runtime/server/services')}').serverMedusaClient`,
        '}'
      ].join('\n')
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolver.resolve(nuxt.options.buildDir, 'types/medusa.d.ts') })
    })
  }
})
