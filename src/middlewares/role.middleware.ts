import { Request, Response, NextFunction } from "express";

type Role = "admin" | "customer";

const roleMiddleware = (allowedRole: Role) => {
  return (
    req: Request & { user?: { role: Role } },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

export default roleMiddleware;
