import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@nesoticks/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { Order } from "../models/order";
import { IPayment, Payment } from "../models/payment";
import { natsWrapper } from "../natsWrapper";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
    "/api/payments",
    requireAuth,
    [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        console.log(order);
        if (!order) throw new NotFoundError();

        if (order.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();

        if (order.status === OrderStatus.Cancelled)
            throw new BadRequestError("Cannot pay for a cancelled order");

        if (order.status === OrderStatus.Completed)
            throw new BadRequestError("Cannot pay for a completed order");

        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token,
        });

        const payment = new Payment<IPayment>({
            orderId,
            stripeId: charge.id,
        });

        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
