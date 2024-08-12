
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['medusa']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['medusa']?: ModuleOptions }
}

declare module 'nuxt/schema' {
  interface NuxtConfig { ['medusa']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['medusa']?: ModuleOptions }
}


export { ModuleOptions, default } from './module'
