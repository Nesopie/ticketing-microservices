import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exists is supplied", async () => {
    request(app)
        .post("/api/users/signin")
        .send({
            email: "test@test.com",
            password: "fjlkdsj",
        })
        .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "kjlfdsjkls" })
        .expect(201);

    request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "kjlfdsjkljfklds" })
        .expect(400);
});

it("sets a cookie when on successful sigin in", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "kjlfdsjkls" })
        .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
});
