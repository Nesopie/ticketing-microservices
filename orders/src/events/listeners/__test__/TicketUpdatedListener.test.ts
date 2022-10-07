import { TicketUpdatedEvent } from "@nesoticks/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../natsWrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticketUpdatedListener";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = new Ticket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 1,
    });

    await ticket.save();

    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        title: "new concert",
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 1,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
};

it("finds, updates, and saves a ticket", async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("does not ack for out of order events", async () => {
    const { listener, data, msg, ticket } = await setup();

    data.version = 400;

    expect(msg.ack).toHaveBeenCalledTimes(0);
});
