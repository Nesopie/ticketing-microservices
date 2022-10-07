import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticketCreatedPublisher";

console.clear();

const stan = nats.connect("jfkldsj", "abc", {
    url: "http://localhost:4222",
});

stan.on("connect", async () => {
    console.log("publisher connected to nats");

    const publisher = new TicketCreatedPublisher(stan);
    await publisher.publish({
        id: "1234",
        title: "Concert",
        price: 10,
    });
});
