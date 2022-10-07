import { Listener, OrderCreatedEvent, Subjects } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { expirationQueue } from "../../queues/exprirationQueue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("waiting for", delay, "milliseconds");

        await expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                delay: 60000,
            }
        );

        msg.ack();
    };
}
