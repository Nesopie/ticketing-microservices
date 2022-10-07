import { Publisher } from "./publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./events";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
