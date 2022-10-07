import express, { Request, Response } from "express";
import {
    OrderStatus,
    BadRequestError,
    NotFoundError,
    validateRequest,
} from "@nesoticks/common";
import mongoose from "mongoose";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { IOrder, Order } from "../models/order";
import { natsWrapper } from "../natsWrapper";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedPublisher";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60;

router.post(
    "/api/orders",
    [
        body("ticketId")
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("Ticked Id must be provided"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) throw new NotFoundError();

        const isReserved = await ticket.isReserved();
        if (isReserved) throw new BadRequestError("Ticket is already reserved");

        const expiration = new Date();
        expiration.setSeconds(
            expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
        );

        console.log(req.currentUser);

        const order = new Order<IOrder>({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket,
        });

        await order.save();

        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);
    }
);

export { router as newOrderRouter };
