import express from "express";
import { MESSAGES } from "../constants/messages.js";

const messageRouter = express.Router();

// The client needs some of this copy before it makes any request — the tooltip
// on a control the current user isn't permitted to use, for example. Serving the
// catalog keeps the server the only place message text is defined.
// Unauthenticated: this is UI copy, not data.
messageRouter.get("/", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json({ messages: MESSAGES });
});

export default messageRouter;
