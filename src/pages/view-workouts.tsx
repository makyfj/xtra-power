import { useRouter } from "next/router";

import { trpc } from "src/utils/trpc";

const ViewWorkouts = () => {
  const router = useRouter();
  const { data, isError, isLoading } = trpc.workout.getWorkouts.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <h1 className="title-page">Workouts</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data &&
          data.map((workout, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-2 shadow-lg drop-shadow-lg bg-sky-500 rounded cursor-pointer"
              onClick={() => router.push(`/workout/${workout.id}`)}
            >
              <h2 className="subtitle-page">{workout.name}</h2>
              <p>{workout.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ViewWorkouts;
