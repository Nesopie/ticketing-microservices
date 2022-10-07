import { Subjects } from "./subjects";

export interface Event {
    subject: Subjects;
    data: any;
}

export interface TicketCreatedEvent extends Event {
    subject: Subjects.TicketCreated;
    data: { id: string; title: string; price: number };
}
