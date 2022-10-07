import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../natsWrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
    await request(app)
        .put(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
        .set("Cookie", global.signin())
        .send({
            title: "kljsdj",
            price: 12,
        })
        .expect(404);
});
it("returns a 401 if the user is not authenticated", async () => {
    await request(app)
        .put(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
        .send({
            title: "kljsdj",
            price: 12,
        })
        .expect(401);
});
it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "fkdjsl", price: 10 });

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", global.signin())
        .send({ title: "kjlfds", price: 20 })
        .expect(401);
});
it("returns a 400 if the user provides an invalid title or price", async () => {
    const cookie = global.signin();
    await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "fkdjsl", price: 20 });

    await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "fkdjsl", price: -10 })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "", price: 10 })
        .expect(400);
});
it("returns a 201 if the user is authenticated and provides a valid details", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "fkdjsl", price: 20 });

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Concert",
            price: 12,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.ticket.id}`)
        .send();

    expect(ticketResponse.body.ticket.title).toEqual("Concert");
    expect(ticketResponse.body.ticket.price).toEqual(12);
});

it("publishes an event on update", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "fkdjsl", price: 20 });

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Concert",
            price: 12,
        });

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("rejects updates if the tickets is reserved", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title: "fkdjsl", price: 20 });

    const ticket = await Ticket.findById(response.body.ticket.id);
    ticket!.set("orderId", new mongoose.Types.ObjectId().toHexString());
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "Concert",
            price: 12,
        })
        .expect(400);
});
