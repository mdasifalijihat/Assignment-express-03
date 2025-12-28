import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import BookingController from "./bookings.controller";
import roleMiddleware from "../../middlewares/role.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/", BookingController.createBooking);
router.get("/", BookingController.getBookings);
router.put("/:bookingId/cancel", BookingController.cancelBooking);
router.put(
  "/:bookingId/return",
  roleMiddleware("admin"),
  BookingController.completeBooking
);
router.put(
  "/:bookingId/approve",
  roleMiddleware("admin"),
  BookingController.approveBooking
);

export const bookingRouter = router;
