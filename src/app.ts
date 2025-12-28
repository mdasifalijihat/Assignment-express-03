import express, { Request, Response } from "express";
import initDB from "./db";
import { logger } from "./middlewares/logger";
import { vehiclesRouter } from "./modules/vehicles/vehicles.routes";
import { usersRouter } from "./modules/users/user.routes";
import { bookingRouter } from "./modules/bookings/bookings.routes";
import { authRouter } from "./modules/auth/auth.routes";

const app = express();

// parser
app.use(express.json());

// db
initDB();

// vehicles api route
app.use("/vehicles", vehiclesRouter);

// users routers
app.use("/users", usersRouter);

// booking routers
app.use("/bookings", bookingRouter);

// auth routers
app.use("/auth", authRouter);

// get method
app.get("/", logger, (req: Request, res: Response) => {
  res.send("Hello World! API is running ");
});

// not found route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    path: req.path,
  });
});

export default app;
