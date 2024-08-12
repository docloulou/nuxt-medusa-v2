import Medusa from "@medusajs/js-sdk";
import { useRuntimeConfig, useNuxtApp } from "#imports";
export const useMedusaClient = () => {
  const nuxtApp = useNuxtApp();
  const { medusa: config } = useRuntimeConfig().public;
  if (config.global)
    return nuxtApp.$medusa;
  if (!nuxtApp._medusaClient) {
    nuxtApp._medusaClient = new Medusa(config);
  }
  return nuxtApp._medusaClient;
};
