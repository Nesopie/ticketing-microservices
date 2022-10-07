import { useEffect, useState } from "react";
import { buildClient } from "../../api/build-client";
import BaseLayout from "../../components/BaseLayout";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/useRequest";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest(
        "/api/payments",
        "post",
        {
            orderId: order.id,
        },
        (payment) => Router.push("/orders")
    );
    useEffect(() => {
        const findTimeLeft = () =>
            setTimeLeft(
                Math.round((+new Date(order.expiresAt) - +new Date()) / 1000)
            );
        findTimeLeft();
        setInterval(findTimeLeft, 1000);
    }, []);
    return (
        <BaseLayout currentUser={currentUser}>
            {timeLeft < 0 ? (
                <div>Order Expired</div>
            ) : (
                <div>
                    Time left to pay: {timeLeft}
                    <StripeCheckout
                        token={({ id }) => {
                            doRequest({ token: id });
                        }}
                        stripeKey={
                            "pk_test_51Lpx0AABuEkCK49HrvVp89OSoHhxXX85wFeKEubwPudQyC12vIwCP49ywrZXhULGf7U0hlm9xbxKclABBznVKyGu00RGhkYWPb"
                        }
                        amount={order.ticket.price * 100}
                        email={currentUser.email}
                    />
                    {errors}
                </div>
            )}
        </BaseLayout>
    );
};

export async function getServerSideProps({ query, req }) {
    let authResponse;
    let response;
    try {
        authResponse = await buildClient({ req }).get(`/api/users/currentUser`);
        authResponse = authResponse.data;

        response = await buildClient({ req }).get(
            `/api/orders/${query.orderId}`
        );
        response = response.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
    return {
        props: {
            order: response || null,
            currentUser: authResponse.currentUser,
        },
    };
}

export default OrderShow;
