import Router from "next/router";
import React from "react";
import { buildClient } from "../../api/build-client";
import BaseLayout from "../../components/BaseLayout";
import { useRequest } from "../../hooks/useRequest";

const TicketShow = ({ ticket, currentUser }) => {
    const { doRequest, errors } = useRequest(
        "/api/orders",
        "post",
        { ticketId: ticket.id },
        (order) => Router.push(`/orders/${order.id}`)
    );
    return (
        <BaseLayout currentUser={currentUser}>
            <div>
                <h1>{ticket.title}</h1>
                <h4>Price: {ticket.price}</h4>
                {errors}
                <button
                    onClick={() => doRequest()}
                    className="btn btn-primary mt-2"
                >
                    Purchase
                </button>
            </div>
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
            `/api/tickets/${query.ticketId}`
        );
        response = response.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
    return {
        props: {
            ticket: response.ticket,
            currentUser: authResponse.currentUser,
        },
    };
}

export default TicketShow;
