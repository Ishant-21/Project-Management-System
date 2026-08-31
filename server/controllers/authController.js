import prisma from "../configs/prisma.js";
import { MESSAGES } from "../constants/messages.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: MESSAGES.AUTH_CREDENTIALS_REQUIRED });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(400).json({ message: MESSAGES.AUTH_USER_EXISTS });
    }

    const hashed = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        id,
        name: name || "",
        email,
        password: hashed,
      },
      select: { id: true, name: true, email: true },
    });

    // Do not return an auth token on registration to avoid auto-login.
    // Require the user to explicitly sign in via /auth/login.
    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || error.code });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("[auth] login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ message: MESSAGES.AUTH_CREDENTIALS_REQUIRED });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    console.log("[auth] user found:", !!user);

    if (!user || !user.password) {
      return res.status(400).json({ message: MESSAGES.AUTH_INVALID_CREDENTIALS });
    }

    const match = await bcrypt.compare(password, user.password);

    console.log("[auth] password match:", match);

    if (!match) {
      return res.status(400).json({ message: MESSAGES.AUTH_INVALID_CREDENTIALS });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || error.code });
  }
};

export const me = async (req, res) => {
  try {
    const { userId } = await req.auth();

    if (!userId) return res.status(401).json({ message: MESSAGES.AUTH_UNAUTHORIZED });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || error.code });
  }
};
