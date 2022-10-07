import mongoose from "mongoose";
import { natsWrapper } from "./natsWrapper";
import { app } from "./app";
import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { OrderCancelledListener } from "./events/listeners/OrderCancelledListener";

(async () => {
    try {
        if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
        if (!process.env.MONGO_URI)
            throw new Error("MONGO_URI must be defined");
        if (!process.env.NATS_CLIENT_ID)
            throw new Error("NATS_CLIENT_ID must be defined");
        if (!process.env.NATS_CLUSTER_ID)
            throw new Error("CLUSTER_ID must be defined");
        if (!process.env.NATS_URL)
            throw new Error("CLUSTER_ID must be defined");

        await mongoose.connect(process.env.MONGO_URI);
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
        new OrderCancelledListener(natsWrapper.client).listen();

        console.log("Connected to mongodb");
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!");
    });
})();
