import express, { Request, Response } from "express";
import {
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest,
} from "@nesoticks/common";
import { Order } from "../models/order";
import { body } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get(
    "/api/orders/:orderId",
    requireAuth,
    // [
    //     body("ticketId")
    //         .not()
    //         .isEmpty()
    //         .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    //         .withMessage("Ticked Id must be provided"),
    // ],
    // validateRequest,
    // () => console.log("hi"),
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate(
            "ticket"
        );

        if (!order) throw new NotFoundError();
        if (order.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();
        res.send(order);
    }
);

export { router as showOrderRouter };
