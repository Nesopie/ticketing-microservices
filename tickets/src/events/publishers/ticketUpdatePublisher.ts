import { Publisher, Subjects, TicketUpdatedEvent } from "@nesoticks/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
