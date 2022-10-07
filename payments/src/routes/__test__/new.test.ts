import { OrderStatus } from "@nesoticks/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { IOrder, Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

it("returns a 404 when purchasing that does not exist", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "jkflsdj",
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});
it("returns a 401 when purchasing that does not belong to the current user", async () => {
    const order = new Order<IOrder>({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "jkflsdj",
            orderId: order.id,
        })
        .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
    const order = new Order<IOrder>({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        price: 20,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(order.userId))
        .send({
            token: "jkflsdj",
            orderId: order.id,
        })
        .expect(400);
});

it("returns a 201 with valid inputs", async () => {
    const price = Math.floor(Math.random() * 10000);
    const order = new Order<IOrder>({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(order.userId))
        .send({
            token: "tok_visa",
            orderId: order.id,
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 10 });
    const stripeCharge = stripeCharges.data.find(
        (charge) => charge.amount === price * 100
    );

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual("usd");

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });

    expect(payment).not.toBeNull();
});
