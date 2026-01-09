import { productRouter } from "~/server/api/routers/product";
import { categoryRouter } from "~/server/api/routers/category";
import { checkoutRouter } from "~/server/api/routers/checkout";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  category: categoryRouter,
  checkout: checkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.product.getAll();
 *       ^? Product[]
 */
export const createCaller = createCallerFactory(appRouter);
