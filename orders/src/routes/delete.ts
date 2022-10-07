import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@nesoticks/common";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { Order } from "../models/order";
import { ITicketDoc } from "../models/ticket";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.patch(
    "/api/orders/:orderId",
    requireAuth,
    [
        body("ticketId")
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("Ticket Id must be provided"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const order = await Order.findById(
            req.params.orderId
        ).populate<ITicketDoc>("ticket");
        if (!order) throw new NotFoundError();

        if (order.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();

        if (
            order.status === OrderStatus.Cancelled ||
            order.status === OrderStatus.Completed
        ) {
            throw new BadRequestError(
                "Cannot cancel a cancelled / completed order"
            );
        }
        order.set("status", OrderStatus.Cancelled);
        await order.save();

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket._id.toString(),
            },
        });

        res.send(order);
    }
);

export { router as deleteOrderRouter };
