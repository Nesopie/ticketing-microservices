import { OrderCancelledEvent, Publisher, Subjects } from "@nesoticks/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
