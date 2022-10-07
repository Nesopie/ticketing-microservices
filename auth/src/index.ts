import mongoose from "mongoose";
import { app } from "./app";

(async () => {
    try {
        if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
        if (!process.env.MONGO_URI)
            throw new Error("MONGO_URI must be defined");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongodb");
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!");
    });
})();