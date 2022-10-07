import { Publisher, Subjects, TicketCreatedEvent } from "@nesoticks/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
