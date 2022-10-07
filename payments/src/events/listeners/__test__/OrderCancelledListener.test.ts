import { OrderCancelledEvent, OrderStatus } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { IOrder, Order } from "../../../models/order";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = new Order<IOrder>({
        userId: "fkjldsj",
        status: OrderStatus.Created,
        price: 10,
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: "kjdljs",
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it("updates the status of the order to cancelled", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
});
