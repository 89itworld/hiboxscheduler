import { User, ResetPasswordRequest } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import JWT from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

import sendEmail from "../../../lib/emails/sendMail";
import prisma from "../../../lib/prisma";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid request" });
  }
  if (!email || !email.includes("@")) {
    res.status(422).json({ message: "Invalid email" });
    return;
  }

  try {
    // @ts-ignore
    const maybeUser: User = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        name: true,
      },
    });

    if (maybeUser) {
      const message = "Email address is already registered";
      return res.status(409).json({ message });
    }
    const now = dayjs().toDate();
    const expiry = dayjs().add(6, "hours").toDate();
    // @ts-ignore
    const token = JWT.sign({ email }, process.env.JWT_SECRET);
    const createAccountLink = `${process.env.BASE_URL}/auth/signup/?token=${token}`;
    await prisma.verificationRequest.create({
      data: {
        identifier: req.body.email,
        token,
        expires: new Date(new Date().setHours(24)), // +1 hour
      },
    });
    await sendEmail({
      to: email,
      subject: "Create Account - Hibox Scheduler",
      text: `Dear User, \n\n Use below link to complete the signup to Hibox Scheduler. Please don't share this url to anyone. \n ${createAccountLink} \n\n Best \n Hibox Team`,
    });
    return res.status(201).json({ message: "Create Account Requested" });
  } catch (reason) {
    console.error(reason);
    return res.status(500).json({ message: "Oops!, something went wrong" });
  }
}
