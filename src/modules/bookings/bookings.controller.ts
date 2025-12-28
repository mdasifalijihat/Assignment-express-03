import { Request, Response } from "express";
import BookingService from "./bookings.services";

interface AuthRequest extends Request {
  user?: { userId: number; role: "admin" | "customer" };
}

class BookingController {
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const booking = await BookingService.createBooking({
        ...req.body,
        user_id: req.user!.userId,
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async approveBooking(req: AuthRequest, res: Response) {
    try {
      const booking = await BookingService.approveBooking(
        Number(req.params.bookingId)
      );
      res.json({ success: true, message: "Booking approved", data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getBookings(req: AuthRequest, res: Response) {
    try {
      const bookings =
        req.user!.role === "admin"
          ? await BookingService.getAllBookings()
          : await BookingService.getBookingsByUser(req.user!.userId);
      res.json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const result = await BookingService.cancelBooking(
        Number(req.params.bookingId),
        req.user!.userId
      );
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async completeBooking(req: AuthRequest, res: Response) {
    try {
      const result = await BookingService.completeBooking(
        Number(req.params.bookingId)
      );
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default BookingController;
