import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import UserController from "./user.controller";

const router = Router();

router.get("/", authMiddleware, UserController.getAllUsers);

router.patch("/:userId", authMiddleware, UserController.updateUser);

router.delete("/:userId", authMiddleware, UserController.deleteUser);

export const usersRouter = router;
