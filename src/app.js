import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//* Import Routes
import userRouter from "./routes/userRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";

//* Route Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/restaurant", restaurantRouter);

export { app };
