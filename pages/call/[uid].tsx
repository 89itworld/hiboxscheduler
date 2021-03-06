import DailyIframe from "@daily-co/daily-js";
import { getSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { HeadSeo } from "@components/seo/head-seo";

import prisma from "../../lib/prisma";

export default function JoinCall(props, session) {
  const router = useRouter();

  //if no booking redirectis to the 404 page
  const emptyBooking = props.booking === null;

  //daily.co calls have a 60 minute exit and entry buffer when a user enters a call when it's not available it will trigger the modals
  const now = new Date();
  const enterDate = new Date(now.getTime() + 60 * 60 * 1000);
  const exitDate = new Date(now.getTime() - 60 * 60 * 1000);

  console.log(enterDate);

  //find out if the meeting is upcoming or in the past
  const isPast = new Date(props.booking.endTime) <= exitDate;
  const isUpcoming = new Date(props.booking.startTime) >= enterDate;
  const meetingUnavailable = isUpcoming == true || isPast == true;

  useEffect(() => {
    if (emptyBooking) {
      router.push("/call/no-meeting-found");
    }

    if (isUpcoming) {
      router.push(`/call/meeting-not-started/${props.booking.uid}`);
    }

    if (isPast) {
      router.push(`/call/meeting-ended/${props.booking.uid}`);
    }
  });

  useEffect(() => {
    if (!meetingUnavailable && !emptyBooking && session.userid !== props.booking.user.id) {
      const callFrame = DailyIframe.createFrame({
        theme: {
          colors: {
            accent: "#FFF",
            accentText: "#111111",
            background: "#111111",
            backgroundAccent: "#111111",
            baseText: "#FFF",
            border: "#000000",
            mainAreaBg: "#111111",
            mainAreaBgAccent: "#111111",
            mainAreaText: "#FFF",
            supportiveText: "#FFF",
          },
        },
        showLeaveButton: true,
        iframeStyle: {
          position: "fixed",
          width: "100%",
          height: "100%",
        },
      });
      callFrame.join({
        url: props.booking.dailyRef.dailyurl,
        showLeaveButton: true,
      });
    }
    if (!meetingUnavailable && !emptyBooking && session.userid === props.booking.user.id) {
      const callFrame = DailyIframe.createFrame({
        theme: {
          colors: {
            accent: "#FFF",
            accentText: "#111111",
            background: "#111111",
            backgroundAccent: "#111111",
            baseText: "#FFF",
            border: "#000000",
            mainAreaBg: "#111111",
            mainAreaBgAccent: "#111111",
            mainAreaText: "#FFF",
            supportiveText: "#FFF",
          },
        },
        showLeaveButton: true,
        iframeStyle: {
          position: "fixed",
          width: "100%",
          height: "100%",
        },
      });
      callFrame.join({
        url: props.booking.dailyRef.dailyurl,
        showLeaveButton: true,
        token: props.booking.dailyRef.dailytoken,
      });
    }
  }, []);

  return (
    <>
      <HeadSeo title="Video Conference" description="Join the video call" />
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cal.com/video-og-image.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="https://cal.com/video-og-image.png" />
      </Head>
      <div style={{ zIndex: 2, position: "relative" }}>
        <Link href="/">
          <img
            className="fixed z-10 hidden w-auto h-5 sm:inline-block"
            src="/Hibox-Scheduler-logo-white-word.svg"
            alt="Hibox Scheduler Logo"
            style={{
              top: 46,
              left: 24,
            }}
          />
        </Link>
        {JoinCall}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const booking = await prisma.booking.findUnique({
    where: {
      uid: context.query.uid,
    },
    select: {
      uid: true,
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      user: {
        select: {
          credentials: true,
        },
      },
      attendees: true,
      dailyRef: {
        select: {
          dailyurl: true,
          dailytoken: true,
        },
      },
      references: {
        select: {
          uid: true,
          type: true,
        },
      },
    },
  });

  if (!booking) {
    // TODO: Booking is already cancelled
    return {
      props: { booking: null },
    };
  }

  const bookingObj = Object.assign({}, booking, {
    startTime: booking.startTime.toString(),
    endTime: booking.endTime.toString(),
  });
  const session = await getSession();

  return {
    props: {
      booking: bookingObj,
      session: session,
    },
  };
}
