import { Listener, Subjects, TicketCreatedEvent } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    onMessage = async (data: TicketCreatedEvent["data"], msg: Message) => {
        const { title, price, id: _id } = data;
        const ticket = new Ticket({ title, price, _id });
        await ticket.save();

        msg.ack();
    };
}
