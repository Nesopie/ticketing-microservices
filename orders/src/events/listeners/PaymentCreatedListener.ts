import {
    Listener,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    onMessage = async (data: PaymentCreatedEvent["data"], msg: Message) => {
        const order = await Order.findById(data.orderId);

        try {
            if (!order) throw new Error("Order not found");
        } catch (err) {
            console.log("Order not found");
            return;
        }

        order.set({ status: OrderStatus.Completed });

        await order.save();
        msg.ack();
    };
}
