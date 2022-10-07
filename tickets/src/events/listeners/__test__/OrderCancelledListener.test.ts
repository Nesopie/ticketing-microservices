import { OrderCancelledEvent, OrderStatus } from "@nesoticks/common";
import mongoose from "mongoose";
import { ITicket, Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = new Ticket<ITicket>({
        title: "Concert",
        price: 20,
        userId: "kdjls",
        orderId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const data: OrderCancelledEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

it("updates the ticket, publishes the event and acks the message", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalledTimes(1);
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
