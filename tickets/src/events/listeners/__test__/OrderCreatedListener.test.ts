import { OrderCreatedEvent, OrderStatus } from "@nesoticks/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = new Ticket({
        title: "concert",
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: ticket.userId,
        expiresAt: "kjdlsj",
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

it("sets the user id of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the mesasge", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("publishes a ticket updated event", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);

    expect(
        JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])[
            "orderId"
        ]
    ).toEqual(data.id);
});
