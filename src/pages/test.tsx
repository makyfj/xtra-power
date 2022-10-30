import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import superjson from "superjson";
import { useRouter } from "next/router";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import { createContextInner } from "src/server/trpc/context";
import { appRouter } from "src/server/trpc/router";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { useEffect } from "react";

const Test = (
  {email}: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const router = useRouter();

  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);
  return <div>Test</div>;
};

export default Test;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  const ctx = createContextInner({
    session,
  });

  const ssg = createProxySSGHelpers({
    ctx: await ctx,
    router: appRouter,
    transformer: superjson,
  });

  const email = session?.user?.email as string;

  await ssg.user.getUserByEmail.prefetch({
    email,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      email: email ?? null,
    },
  };
};
