import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "testpassword",
        })
        .expect(201);
});

it("returns a 400 with an invalid email", async () => {
    request(app)
        .post("/api/users/signup")
        .send({
            email: "jfkldsj@kljfdslkj",
            password: "",
        })
        .expect(400);
});

it("returns a 400 with an invalid password", async () => {
    request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "123",
        })
        .expect(400);
});

it("returns a 400 with missing email and password", async () => {
    request(app).post("/api/users/signup").send({}).expect(400);
});

it("returns a 400 with missing email or password", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "uwu@gmail.com" })
        .expect(400);

    await request(app)
        .post("/api/users/signup")
        .send({ password: "123" })
        .expect(400);
});

it("disallows duplicate emails", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "1234weq" })
        .expect(201);
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "1234weq" })
        .expect(400);
});

it("sets a cookie on successful on signup", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "1234weq" })
        .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
});
