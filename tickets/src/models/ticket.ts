import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface ITicket {
    title: string;
    price: number;
    userId: string;
    orderId?: string;
}

export interface ITicketDoc extends ITicket, Document {
    version: number;
}

const ticketSchema = new mongoose.Schema<ITicket>({
    title: {
        type: String,
        require: true,
    },

    price: {
        type: Number,
        require: true,
    },

    userId: {
        type: String,
        required: true,
    },

    orderId: {
        type: String,
    },
});

ticketSchema.set("toJSON", {
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    },
});

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

const Ticket = mongoose.model<ITicketDoc>("ticket", ticketSchema);

export { Ticket };
