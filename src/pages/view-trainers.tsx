import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import Menu from "src/components/menu";
import Spinner from "src/components/spinner";
import { trpc } from "src/utils/trpc";
import { ssrInit } from "src/utils/ssg";

const SelectTrainer = ({
  email,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const utils = trpc.useContext();

  const {
    data: myTrainerData,
    isLoading: myTrainerIsLoading,
    isError: myTrainerIsError,
  } = trpc.client.getMyTrainer.useQuery({ email });

  const { data, isLoading, isError } = trpc.trainer.getTrainers.useQuery();
  const user = utils.user.getUserByEmail.getData({
    email,
  });

  const addTrainer = trpc.client.addTrainer.useMutation({
    async onSuccess() {
      await utils.user.getUserByEmail.invalidate();
      await utils.trainer.getTrainers.invalidate();
    },
  });

  const removeTrainer = trpc.client.removeTrainer.useMutation({
    async onSuccess() {
      await utils.user.getUserByEmail.invalidate();
      await utils.trainer.getTrainers.invalidate();
    },
  });

  const onTrainerSelect = async (trainerId: string) => {
    try {
      if (user) {
        await addTrainer
          .mutateAsync({
            userId: user.id as string,
            trainerId,
          })
          .then(() => {
            router.push("/view-trainers");
          });
      }
    } catch {}
  };

  const onTrainerRemove = async (trainerId: string) => {
    try {
      if (user) {
        await removeTrainer
          .mutateAsync({
            userId: user.id as string,
            trainerId,
          })
          .then(() => {
            router.push("/");
          });
      }
    } catch {}
  };

  return (
    <Menu>
      <Head>
        <title>Select Trainer</title>
      </Head>
      <div className="flex flex-col gap-2">
        <div className="container mx-auto flex flex-col gap-4">
          <h2 className="title-page text-3xl">My Trainer</h2>
          {myTrainerIsLoading && <Spinner />}
          {myTrainerIsError && (
            <p className="text-center font-bold text-red-400 text-lg">
              You do not have a trainer yet
            </p>
          )}

          {myTrainerData ? (
            <div className="flex flex-col gap-2 bg-slate-700 text-slate-200 mx-auto p-2 rounded">
              <p className="text-center text-lg">
                Your trainer is{" "}
                <span className="font-bold">{myTrainerData.name}</span>
              </p>
              <p className="text-center text-lg">
                Your trainer{`'`}s email is{" "}
                <span className="font-bold">{myTrainerData.email}</span>
              </p>
              <div className="flex justify-center">
                <button
                  className="button bg-slate-200 text-slate-700 w-full p-1 hover:bg-slate-300 hover:text-slate-800"
                  onClick={() => onTrainerRemove(myTrainerData.id)}
                >
                  Remove Trainer
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center font-bold text-red-700 text-lg">
              You do not have a trainer yet
            </p>
          )}
        </div>
        <div className="container mx-auto flex flex-col gap-4">
          <h2 className="title-page text-3xl">View Active Trainers</h2>
          {isLoading && <Spinner />}
          {isError && (
            <p className="text-center font-bold text-red-400 text-lg">
              Error loading trainers
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data &&
            data.map((trainer, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 p-2 shadow-lg drop-shadow-lg bg-stone-100 border-stone-300 border rounded"
              >
                <h2 className="text-lg">
                  <span className="font-bold">Trainer:</span> {trainer.name}
                </h2>
                <button
                  className="button w-full h-10"
                  onClick={() => onTrainerSelect(trainer.id)}
                >
                  Select
                </button>
              </div>
            ))}
        </div>
      </div>
    </Menu>
  );
};

export default SelectTrainer;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { ssg, session } = await ssrInit(context);

  const email = session?.user?.email as string;

  if (email) {
    const user = await ssg.user.getUserByEmail.fetch({
      email,
    });

    if (user?.clientId) {
      await ssg.trainer.getTrainers.prefetch();
      await ssg.client.getMyTrainer.prefetch({ email });
      return {
        props: {
          trpcState: ssg.dehydrate(),
          email,
        },
      };
    } else {
      return {
        props: {
          trpcState: ssg.dehydrate(),
        },
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  } else {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        email: null,
      },

      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
