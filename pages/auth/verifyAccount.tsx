import { LoginIcon } from "@heroicons/react/solid";
import JWT from "jsonwebtoken";
import Link from "next/link";
import React from "react";

import { getSession } from "@lib/auth";
import { useLocale } from "@lib/hooks/useLocale";
import prisma from "@lib/prisma";

import { HeadSeo } from "@components/seo/head-seo";

export default function VerifyAccount({ csrfToken, error }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <HeadSeo title="Account verification" description={t("verify_email")} />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 mx-2 space-y-6 bg-white rounded-lg shadow sm:px-10">
          <div className="space-y-6">
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">{t("done")}</h2>
            <p>Your Email has successfully been verified, Click below button to login it to the app.</p>
            <button className="p-2 text-white rounded-full bg-hiboxBlue-900 hover:bg-hiboxBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              <Link href="/auth/login">
                <a>Click to login</a>
              </Link>
            </button>
            {error && <p className="text-red-600">{error?.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { req, res } = ctx;
  const session = await getSession({ req });

  if (session) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  if (!ctx.query.token) {
    return {
      notFound: true,
    };
  }
  const verificationRequest = await prisma.verificationRequest.findUnique({
    where: {
      token: ctx.query.token,
    },
  });

  if (!verificationRequest?.token) {
    return {
      redirect: { permanent: false, destination: "/auth/login" },
    };
  }

  const requestToken = ctx.query.token;
  const serverToken = verificationRequest.token;
  const requestTokenDecoded = JWT.verify(requestToken, process.env.JWT_SECRET);
  const serverTokenDecoded = JWT.verify(serverToken, process.env.JWT_SECRET);
  const isExpired = new Date(verificationRequest.expires).getTime() < new Date().getTime();
  if (requestTokenDecoded?.email !== serverTokenDecoded?.email || isExpired) {
    return {
      redirect: { permanent: false, destination: "/auth/login" },
    };
  }

  await prisma.user.update({
    where: { email: serverTokenDecoded?.email },
    data: {
      emailVerified: new Date(Date.now()),
    },
  });

  return { props: { email: verificationRequest.identifier, isVerified: true } };
}
