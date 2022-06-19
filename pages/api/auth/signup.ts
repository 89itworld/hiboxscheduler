import JWT from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@lib/auth";
import sendEmail from "@lib/emails/sendMail";
import prisma from "@lib/prisma";
import slugify from "@lib/slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;
  const { email, password } = data;
  const username = slugify(data.username);
  const userEmail = email.toLowerCase();

  if (!username) {
    res.status(422).json({ message: "Invalid username" });
    return;
  }

  if (!userEmail || !userEmail.includes("@")) {
    res.status(422).json({ message: "Invalid email" });
    return;
  }

  if (!password || password.trim().length < 7) {
    res.status(422).json({ message: "Invalid input - password should be at least 7 characters long." });
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: username,
        },
        {
          email: userEmail,
        },
      ],
    },
  });

  if (existingUser && existingUser.emailVerified) {
    const message: string =
      existingUser.email !== userEmail ? "Username already taken" : "Email address is already registered";

    return res.status(409).json({ message });
  } else if (existingUser && !existingUser.emailVerified) {
    await sendVerificationLink({ email });
    const message = "An email verification link sent to this email address";
    return res.status(200).json({ message });
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      username,
      password: hashedPassword,
      emailVerified: new Date(Date.now()),
    },
    create: {
      username,
      email: userEmail,
      password: hashedPassword,
    },
  });
  await sendVerificationLink({ email });
  res.status(201).json({ message: "An email verification link sent to this email address" });
}

async function sendVerificationLink({ email }) {
  const token = JWT.sign({ email }, process.env.JWT_SECRET);
  const createAccountLink = `${process.env.BASE_URL}/auth/verifyAccount/?token=${token}`;
  await prisma.verificationRequest.create({
    data: {
      identifier: email,
      token,
      expires: new Date(new Date().setHours(240)), // +10 days
    },
  });
  await sendEmail({
    to: email,
    subject: "Create Account - Hibox Scheduler",
    text: `Dear User, \n\n Use below link to complete the signup to Hibox Scheduler. Please don't share this url to anyone. \n ${createAccountLink} \n\n Best \n Hibox Team`,
  });
}
