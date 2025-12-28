import { Request, Response } from "express";
import VehicleService from "./vehicles.service";


interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "admin" | "customer";
  };
}

class VehicleController {
  // ==============================
  // CREATE VEHICLE (ADMIN)
  // ==============================
  static async createVehicle(req: AuthRequest, res: Response) {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create vehicles",
      });
    }

    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==============================
  // GET ALL VEHICLES (PUBLIC)
  // ==============================
  static async getAllVehicles(req: Request, res: Response) {
    try {
      const vehicles = await VehicleService.getAllVehicles();
      res.json({
        success: true,
        data: vehicles,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==============================
  // GET VEHICLE BY ID (PUBLIC)
  // ==============================
  static async getVehicle(req: Request, res: Response) {
    try {
      const vehicle = await VehicleService.getVehicleById(
        Number(req.params.vehicleId)
      );

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }

      res.json({
        success: true,
        data: vehicle,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==============================
  // UPDATE VEHICLE (ADMIN)
  // ==============================
  static async updateVehicle(req: AuthRequest, res: Response) {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update vehicles",
      });
    }

    try {
      const vehicle = await VehicleService.updateVehicle(
        Number(req.params.vehicleId),
        req.body
      );

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found or no data to update",
        });
      }

      res.json({
        success: true,
        data: vehicle,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==============================
  // DELETE VEHICLE (ADMIN)
  // ==============================
  static async deleteVehicle(req: AuthRequest, res: Response) {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete vehicles",
      });
    }

    try {
      await VehicleService.deleteVehicle(Number(req.params.vehicleId));
      res.json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default VehicleController;
