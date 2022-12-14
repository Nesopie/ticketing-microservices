import { PaymentCreatedEvent, Publisher, Subjects } from "@nesoticks/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
