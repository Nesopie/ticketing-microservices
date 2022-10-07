import mongoose, { Document, Model, Types } from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "@nesoticks/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface ITicket {
    title: string;
    price: number;
}

export interface ITicketDoc extends Document, ITicket {
    version: number;
    isReserved(): Promise<boolean>;
}

export interface ITicketModel extends ITicket, Model<ITicketDoc> {
    findByEvent<T extends { id: string; version: number }>(
        data: T
    ): Promise<
        | (ITicketDoc & {
              _id: Types.ObjectId;
          })
        | null
    >;
}

const ticketSchema = new mongoose.Schema<ITicketDoc>({
    title: {
        type: String,
        require: true,
    },

    price: {
        type: Number,
        require: true,
    },
});

ticketSchema.set("toJSON", {
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = async <
    T extends { id: string; version: number }
>(
    data: T
): Promise<(ITicketDoc & { _id: Types.ObjectId }) | null> => {
    return await Ticket.findOne({ _id: data.id, version: data.version - 1 });
};

ticketSchema.methods.isReserved = async function () {
    return !!(await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Completed,
            ],
        },
    }));
};

const Ticket = mongoose.model<ITicketDoc>(
    "ticket",
    ticketSchema
) as ITicketModel;

export { Ticket };
