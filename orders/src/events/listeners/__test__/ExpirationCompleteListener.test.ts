import { ExpirationCompleteEvent, OrderStatus } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { IOrder, Order } from "../../../models/order";
import { ITicket, Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const ticket = new Ticket<ITicket>({
        title: "concert",
        price: 20,
    });

    await ticket.save();

    const order = new Order<IOrder>({
        userId: "kljgdfs",
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });

    await order.save();

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, data, msg, ticket };
};

it("updates the order status to cancelled", async () => {
    const { listener, order, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emites an order cancelled event", async () => {
    const { listener, order, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
    expect(
        JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
            .id
    ).toEqual(order.id);
});

it("acks the message", async () => {
    const { listener, order, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
});
