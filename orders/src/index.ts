import mongoose from "mongoose";
import { natsWrapper } from "./natsWrapper";
import { app } from "./app";
import { TicketCreatedListener } from "./events/listeners/TicketCreatedListener";
import { TicketUpdatedListener } from "./events/listeners/ticketUpdatedListener";
import { ExpirationCompleteListener } from "./events/listeners/ExpirationCompleteListener";
import { PaymentCreatedListener } from "./events/listeners/PaymentCreatedListener";

(async () => {
    console.log("Staring up....");
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

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        console.log("Connected to mongodb");
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!");
    });
})();
