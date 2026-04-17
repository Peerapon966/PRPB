import { defineMiddleware } from "astro:middleware";

export interface Locals {
  theme: "dark" | "light";
}

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  (locals as Locals).theme = "dark";

  const response = await next();

  return response;
});
