import { Request, Response } from "express";
import UserService from "./user.service";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "admin" | "customer";
  };
}

class UserController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  }

  static async updateUser(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const targetUserId = Number(req.params.userId);

    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const loggedInUser = req.user;

    if (
      loggedInUser.role === "customer" &&
      loggedInUser.userId !== targetUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile",
      });
    }

    if (
      loggedInUser.role === "customer" &&
      typeof req.body.role !== "undefined"
    ) {
      return res.status(403).json({
        success: false,
        message: "Role change not allowed",
      });
    }

    try {
      const user = await UserService.updateUser(targetUserId, req.body);

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    try {
      await UserService.deleteUser(userId);
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default UserController;
