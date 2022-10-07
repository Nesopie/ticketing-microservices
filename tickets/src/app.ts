import express from "express";
import "express-async-errors";
const bodyParser = require("body-parser");
import cookieSession from "cookie-session";
import cors from "cors";

import { ticketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { errorHandler, NotFoundError, currentUser } from "@nesoticks/common";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();

app.set("trust proxy", true);
app.use(bodyParser.json());
app.use(cors());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== "test",
    })
);
app.use(currentUser);
app.use(ticketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res, next) => {
    throw new NotFoundError();
});

app.use(errorHandler);
export { app };
