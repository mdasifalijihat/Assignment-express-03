import { Router } from "express";
import VehicleController from "./vehicles.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";

const router = Router();

// Public
router.get("/", VehicleController.getAllVehicles);
router.get("/:vehicleId", VehicleController.getVehicle);

// Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  VehicleController.createVehicle
);

router.put(
  "/:vehicleId",
  authMiddleware,
  roleMiddleware("admin"),
  VehicleController.updateVehicle
);

router.delete(
  "/:vehicleId",
  authMiddleware,
  roleMiddleware("admin"),
  VehicleController.deleteVehicle
);

export const vehiclesRouter = router;
