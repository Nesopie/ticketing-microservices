import { Listener, OrderCreatedEvent, Subjects } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { IOrder, Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
        const order = new Order<IOrder>({
            price: data.ticket.price,
            userId: data.userId,
            status: data.status,
        });

        order.set({ version: data.version, _id: data.id });

        await order.save();
        msg.ack();
    };
}
