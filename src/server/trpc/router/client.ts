import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { t, authedProcedure } from "../trpc";

export const clientRouter = t.router({
  createClient: authedProcedure
    .input(
      z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        image: z.string().nullable(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { name, email, image, userId } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not exist",
        });
      }

      if (user?.clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Client already exists",
        });
      } else {
        // update user with client id
        const userUpdate = await ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            clientId: userId,
          },
        });

        return userUpdate;
      }
    }),

  addTrainer: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        trainerId: z.string(),
      })
    )
    .mutation(({ ctx, input: { userId, trainerId } }) => {
      // Update the user model with the trainerId and clientId
      const user = ctx.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          trainer: {
            connect: {
              id: trainerId,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add trainer",
        });
      }

      console.log("user", user);

      return user;
    }),

  removeTrainer: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        trainerId: z.string(),
      })
    )
    .mutation(({ ctx, input: { userId, trainerId } }) => {
      // Remove the userId from the trainer model based on the trainerId
      return ctx.prisma.trainer.update({
        where: {
          id: trainerId,
        },
        data: {
          users: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
    }),

  getClient: authedProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(({ ctx, input: { email } }) => {
      if (email) {
        const client = ctx.prisma.client.findUnique({
          where: {
            email,
          },
        });

        if (!client) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create client",
          });
        }

        return client;
      }
    }),

  deleteClient: authedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete trainer",
        });
      }

      const client = await ctx.prisma.client.delete({
        where: {
          id: user.clientId as string,
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete trainer",
        });
      }
    }),

  getMyTrainer: authedProcedure
    .input(
      z.object({
        email: z.string().nullable().nullish(),
      })
    )
    .query(({ ctx, input: { email } }) => {
      // Go through the trainer table and find the user with the userId
      if (email) {
        const trainer = ctx.prisma.trainer.findFirst({
          where: {
            users: {
              some: {
                email,
              },
            },
          },
        });

        if (!trainer) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get trainer",
          });
        }

        return trainer;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get email",
        });
      }
    }),
});
