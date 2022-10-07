import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
    var signin: () => string[];
}

let mongo: MongoMemoryServer;

jest.mock("../natsWrapper");

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    process.env.JWT_KEY = "SECRET";
    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = () => {
    const token = jwt.sign(
        {
            email: "test@test.com",
            id: new mongoose.Types.ObjectId().toHexString(),
        },
        process.env.JWT_KEY!
    );
    const base64 = Buffer.from(JSON.stringify({ jwt: token })).toString(
        "base64"
    );

    return [`session=${base64}`];
};
