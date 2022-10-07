import mongoose from "mongoose";
import { OrderStatus } from "@nesoticks/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface IOrder {
    userId: string;
    status: OrderStatus;
    price: number;
}

export interface IOrderDoc extends IOrder, mongoose.Document {
    version: number;
}

export interface IOrderModel extends mongoose.Model<IOrderDoc, {}, {}, {}> {}

const orderSchema = new mongoose.Schema<IOrder>({
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: OrderStatus,
        defailt: OrderStatus.Created,
    },
    price: {
        type: Number,
        required: true,
    },
});

orderSchema.set("toJSON", {
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

// orderSchema.statics.findByEvent = async <
//     T extends { id: string; version: number }
// >(
//     data: T
// ): Promise<IOrderDoc | null> => {
//     return await Order.findOne({ _id: data.id, version: data.version - 1 });
// };

const Order = mongoose.model<IOrderDoc, IOrderModel>(
    "order",
    orderSchema
) as IOrderModel;

export { Order };
