// src/server/trpc/router/index.ts
import { t } from "../trpc";

import { authRouter } from "./auth";
import { workoutRouter } from "./workout";
import { userRouter } from "./user";
import { exerciseRouter } from "./exercise";
import { setRouter } from "./set";
import { clientRouter } from "./client";
import { trainerRouter } from "./trainer";
import { sessionRouter } from "./session";

export const appRouter = t.router({
  auth: authRouter,
  workout: workoutRouter,
  exercise: exerciseRouter,
  session: sessionRouter,
  set: setRouter,
  user: userRouter,
  client: clientRouter,
  trainer: trainerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
