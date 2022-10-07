import mongoose from "mongoose";

export interface IPayment {
    orderId: string;
    stripeId: string;
}

export interface IPaymentDoc extends IPayment, mongoose.Document {
    version: number;
}

export interface IPaymentModel extends mongoose.Model<IPayment> {}

const paymentSchema = new mongoose.Schema<IPayment>({
    orderId: {
        type: String,
        required: true,
    },
    stripeId: {
        type: String,
        required: true,
    },
});

paymentSchema.set("toJSON", {
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

export const Payment = mongoose.model<IPaymentDoc, IPaymentModel>(
    "payment",
    paymentSchema
) as IPaymentModel;
