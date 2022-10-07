import express, { Request, Response } from "express";
import "express-async-errors";
const bodyParser = require("body-parser");
import cookieSession from "cookie-session";
import cors from "cors";

import { errorHandler, NotFoundError, currentUser } from "@nesoticks/common";
import { createChargeRouter } from "./routes/new";

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
app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
    throw new NotFoundError();
});

app.use(errorHandler);
export { app };
