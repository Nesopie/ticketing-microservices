import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest,
} from "@nesoticks/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticketUpdatePublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.put(
    "/api/tickets/:id",
    requireAuth,
    [body("title").not().isEmpty().withMessage("Title is required")],
    body("price")
        .not()
        .isEmpty()
        .isFloat()
        .withMessage("Price must be greater than 0"),
    validateRequest,
    async (req: Request, res: Response) => {
        let ticket;
        try {
            ticket = await Ticket.findById(req.params.id);
        } catch (err) {
            console.error(req.params.id);
        }

        if (!ticket) throw new NotFoundError();

        if (ticket.orderId)
            throw new BadRequestError("Cannot edit a reserved ticket");
        if (ticket.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();

        ticket.set("title", req.body.title);
        ticket.set("price", req.body.price);

        await ticket.save();

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.send({ ticket });
    }
);

export { router as updateTicketRouter };
