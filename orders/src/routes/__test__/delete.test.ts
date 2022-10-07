import { OrderStatus } from "@nesoticks/common";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../natsWrapper";

it("cancels an order", async () => {
    const ticket = new Ticket({
        title: "Concert",
        price: 20,
    });

    await ticket.save();
    const user = global.signin();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: fetchedOrder } = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
    expect(fetchedOrder.status).toEqual(OrderStatus.Cancelled);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
    const ticket = new Ticket({
        title: "Concert",
        price: 20,
    });

    await ticket.save();
    const user = global.signin();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
