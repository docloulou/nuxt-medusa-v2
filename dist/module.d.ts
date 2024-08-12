import * as _nuxt_schema from '@nuxt/schema';
import { Config } from '@medusajs/js-sdk/dist/types';

type ModuleOptions = Config & {
    global?: boolean;
    server: boolean;
};
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { type ModuleOptions, _default as default };
