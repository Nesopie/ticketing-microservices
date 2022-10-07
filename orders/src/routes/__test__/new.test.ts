import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { IOrder, Order } from "../../models/order";
import { ITicket, Ticket } from "../../models/ticket";
import { OrderStatus } from "@nesoticks/common";
import { natsWrapper } from "../../natsWrapper";

it("returns a 404 if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId })
        .expect(404);
});
it("returns an error if the ticket is already reserved", async () => {
    const ticket = new Ticket<ITicket>({
        title: "Concert",
        price: 20,
    });

    await ticket.save();

    const order = new Order<IOrder>({
        ticket,
        userId: "random",
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });

    await order.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .expect(400);
});
it("reserves a ticket", async () => {
    const ticket = new Ticket<ITicket>({
        title: "Concert",
        price: 20,
    });

    await ticket.save();

    const response = await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("emits an event on order created event", async () => {
    const ticket = new Ticket<ITicket>({
        title: "Concert",
        price: 20,
    });

    await ticket.save();

    const response = await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
