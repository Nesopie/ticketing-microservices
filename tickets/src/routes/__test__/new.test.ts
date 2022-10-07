import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../natsWrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).not.toEqual(404);
});

it("cannot be accessed if a user is not signed in ", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).toEqual(401);
});

it("can be accessed if a user is signed in", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
    let response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "", price: "123" });

    expect(response.status).toEqual(400);

    response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ price: "12343" });

    expect(response.status).toEqual(400);
});

it("returns an error if an invlaid price is provided", async () => {
    let response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "Proper title", price: "-10" });

    expect(response.status).toEqual(400);

    response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "Proper title", price: "" });

    expect(response.status).toEqual(400);

    response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "Proper title" });

    expect(response.status).toEqual(400);
});

it("creates a ticket with valid parameters", async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length === 0);

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "Proper title", price: "100" });

    tickets = await Ticket.find({});

    expect(response.status).toEqual(201);
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(100);
});

it("publishes an event", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({ title: "Proper title", price: "100" });

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
