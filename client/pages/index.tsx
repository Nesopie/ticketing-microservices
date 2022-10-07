import Link from "next/link";
import React from "react";
import { buildClient } from "../api/build-client";
import BaseLayout from "../components/BaseLayout";

const Index = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link
                        href={"/tickets/[ticketId]"}
                        as={`/tickets/${ticket.id}`}
                    >
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <BaseLayout currentUser={currentUser}>
            <div>
                <h1>Tickets</h1>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>{ticketList}</tbody>
                </table>
            </div>
        </BaseLayout>
    );
};

export async function getServerSideProps({ req }) {
    let authResponse;
    let ticketResponse;
    try {
        authResponse = await buildClient({ req }).get(`/api/users/currentUser`);
        authResponse = authResponse.data;
        ticketResponse = await buildClient({ req }).get("/api/tickets");
        ticketResponse = ticketResponse.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
    return {
        props: {
            currentUser: authResponse.currentUser,
            tickets: ticketResponse.tickets,
        },
    };
}

export default Index;
