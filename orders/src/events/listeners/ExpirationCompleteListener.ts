import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects,
} from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";
import { queueGroupName } from "./queueGroupName";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    onMessage = async (data: ExpirationCompleteEvent["data"], msg: Message) => {
        const order = await Order.findById(data.orderId).populate("ticket");
        try {
            if (!order) {
                throw new Error("Ticket not found");
            }
        } catch (err) {
            console.log("Ticket not found");
            return;
        }

        if (order.status === OrderStatus.Completed) {
            return msg.ack();
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });
        msg.ack();
    };
}
