import { useForm, SubmitHandler } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { trpc } from "src/utils/trpc";
import { useSession } from "next-auth/react";

interface WorkoutInput {
  clientId: string;
  name: string;
  description: string;
}

const CreateWorkout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutInput>();

  // const { data: session } = useSession();

  // const { data: user } = trpc.user.getUserByEmail.useQuery({
  //   email: session?.user?.email as string | null,
  // });

  const queryClient = useQueryClient();

  console.log("queryClient, Need to use cache here", queryClient);

  const router = useRouter();
  const utils = trpc.useContext();

  const user = utils.user.getUserByEmail.getInfiniteData({
    email: "",
  });

  console.log("User", user);

  const createWorkout = trpc.workout.createWorkout.useMutation({
    async onSuccess() {
      await utils.workout.getWorkouts.invalidate();
      await utils.workout.getWorkoutById.invalidate();
    },
  });

  const onSubmit: SubmitHandler<WorkoutInput> = async (data) => {
    try {
      // data.clientId = user?.clientId as string;
      const newWorkout = await createWorkout.mutateAsync(data);
      console.log(newWorkout);
      if (newWorkout) {
        router.push(`/workout/${newWorkout.id}`);
      }
    } catch {}
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-2 shadow-lg drop-shadow-lg bg-stone-200 rounded"
      >
        <h2 className="subtitle-page">Create New Workout</h2>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Name"
          {...register("name", { required: true })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs italic">Name is required.</p>
        )}

        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Description"
          {...register("description", { required: true })}
        />
        {errors.description && (
          <p className="text-red-500 text-xs italic">
            Description is required.
          </p>
        )}
        <button className="button w-full" type="submit">
          Submit
        </button>
      </form>
    </>
  );
};

export default CreateWorkout;
