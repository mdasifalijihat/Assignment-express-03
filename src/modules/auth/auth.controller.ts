import { Request, Response } from "express";
import AuthService from "./auth.services";

interface SignupBody {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface SigninBody {
  email: string;
  password: string;
}

class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const user = await AuthService.signup(req.body as SignupBody);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async signin(req: Request, res: Response) {
    const { email, password } = req.body as SigninBody;

    try {
      const result = await AuthService.signin(email, password);

      res.json({
        success: true,
        message: "Login successful",
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default AuthController;
