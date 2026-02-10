import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // expose user id and a compatible req.auth() function used by controllers
    req.userId = decoded?.userId || decoded?.id;
    req.auth = async () => ({ userId: req.userId });

    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: error.message || "Unauthorized" });
  }
};
