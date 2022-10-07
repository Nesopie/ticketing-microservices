import { Listener, Subjects, TicketUpdatedEvent } from "@nesoticks/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    onMessage = async (data: TicketUpdatedEvent["data"], msg: Message) => {
        const { title, price } = data;
        const ticket = await Ticket.findByEvent(data);
        try {
            if (!ticket) {
                throw new Error("Ticket not found");
            }

            ticket.set({ title, price });
            await ticket.save();

            msg.ack();
        } catch (err) {
            console.log("Ticket not found");
            return;
        }
    };
}
