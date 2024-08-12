import Medusa from "@medusajs/js-sdk";
import { useRuntimeConfig } from "#imports";
export const serverMedusaClient = (event) => {
  const { medusa: config } = useRuntimeConfig().public;
  const privateConfig = useRuntimeConfig().private;
  if (!event.context._medusaClient) {
    const medusaClient = new Medusa({ ...config, ...privateConfig });
    event.context._medusaClient = medusaClient;
  }
  return event.context._medusaClient;
};
