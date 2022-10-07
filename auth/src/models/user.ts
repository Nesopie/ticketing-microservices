import mongoose, { Document } from "mongoose";
import { Password } from "../services/password";

export interface IUser {
    email: string;
    password: string;
}

export interface IUserDoc extends Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },
});

userSchema.set("toJSON", {
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
    },
});

userSchema.pre("save", async function (done: any) {
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.password);
        this.password = hashed;
    }

    done();
});

const User = mongoose.model<IUserDoc>("user", userSchema);

export { User };
