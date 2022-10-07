import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { natsWrapper } from "./natsWrapper";

(async () => {
    try {
        if (!process.env.NATS_CLIENT_ID)
            throw new Error("NATS_CLIENT_ID must be defined");
        if (!process.env.NATS_CLUSTER_ID)
            throw new Error("CLUSTER_ID must be defined");
        if (!process.env.NATS_URL)
            throw new Error("CLUSTER_ID must be defined");

        console.log(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        natsWrapper.client.on(
            "close",
            () =>
                (console.log("NATS conection closed") as undefined) ||
                process.exit()
        );

        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }
})();
