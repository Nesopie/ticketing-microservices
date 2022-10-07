import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
    Subjects,
} from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    onMessage = async (data: OrderCancelledEvent["data"], msg: Message) => {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1,
        });

        try {
            if (!order) throw new Error("Ticket not found");
        } catch (err) {
            console.log("Ticket not found");
            return;
        }

        order.set({ status: OrderStatus.Cancelled });

        await order.save();
        msg.ack();
    };
}
