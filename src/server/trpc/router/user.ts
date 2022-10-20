import { t, authedProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = t.router({
  getUserByEmail: authedProcedure
    .input(
      z.object({
        email: z.string().nullable(),
      })
    )
    .query(({ ctx, input: { email } }) => {
      if (email) {
        const user = ctx.prisma.user.findUniqueOrThrow({
          where: {
            email: email,
          },
        });

        return user;
      }
    }),

  createUser: authedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        type: z.string(),
      })
    )
    .mutation(({ ctx, input: { name, email, type } }) => {
      const user = ctx.prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      });

      return user;
    }),

  updateTypeUser: authedProcedure
    .input(
      z.object({
        id: z.string(),
        clientId: z.string().nullable(),
        trainerId: z.string().nullable(),
      })
    )
    .mutation(({ ctx, input: { id, clientId, trainerId } }) => {
      if (clientId) {
        const updatedUser = ctx.prisma.user.update({
          where: {
            id,
          },
          data: {
            clientId,
          },
        });
        return updatedUser;
      } else {
        const updatedUser = ctx.prisma.user.update({
          where: {
            id,
          },
          data: {
            trainerId,
          },
        });
        return updatedUser;
      }
    }),
  updateUser: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
      })
    )
    .mutation(({ ctx, input: { id, name, type } }) => {
      const user = ctx.prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      return user;
    }),

  deleteUser: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => {
      const user = ctx.prisma.user.delete({
        where: {
          id,
        },
      });

      return user;
    }),
});
