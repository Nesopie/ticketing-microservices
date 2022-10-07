import { Listener, OrderCancelledEvent, Subjects } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatePublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    onMessage = async (data: OrderCancelledEvent["data"], msg: Message) => {
        const ticket = await Ticket.findById(data.ticket.id);

        try {
            if (!ticket) throw new Error("Ticket not found");
        } catch (err: unknown) {
            console.log("Ticket not found");
            return;
        }

        ticket.set("orderId", undefined);
        await ticket.save();

        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });

        msg.ack();
    };
}
