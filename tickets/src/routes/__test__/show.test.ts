import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";

it("returns a 404 if the ticket is not found", async () => {
    const response = await request(app)
        .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
        .send();

    expect(response.status).toEqual(404);
});

it("returns a 200 if the ticket is found", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "concert", price: "20" })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.ticket.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.ticket.title).toEqual("concert");
    expect(ticketResponse.body.ticket.price).toEqual(20);
});
