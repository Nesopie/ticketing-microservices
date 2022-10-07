import { Message, Stan } from "node-nats-streaming";
import { Event } from "./events";

export abstract class Listener<E extends Event> {
    abstract subject: E["subject"];
    abstract queueGroupName: string;
    private client: Stan;
    protected ackWait: number = 5 * 1000;
    abstract onMessage: (data: E["data"], msg: Message) => void;

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }

    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        );

        subscription.on("message", (msg: Message) => {
            console.log(
                `Message received: ${this.subject} / ${this.queueGroupName}`
            );

            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }

    parseMessage(msg: Message): E["data"] {
        const data = msg.getData();
        return JSON.parse(data.toString());
    }
}
