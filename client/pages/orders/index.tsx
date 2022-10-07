import { buildClient } from "../../api/build-client";
import BaseLayout from "../../components/BaseLayout";

const OrderIndex = ({ currentUser, orders }) => {
    return (
        <BaseLayout currentUser={currentUser}>
            <ul>
                {orders.map((order) => {
                    return (
                        <li key={order.id}>
                            {order.ticket.title} - {order.status}
                        </li>
                    );
                })}
            </ul>
        </BaseLayout>
    );
};

export async function getServerSideProps({ req }) {
    let authResponse;
    let response;
    try {
        authResponse = await buildClient({ req }).get(`/api/users/currentUser`);
        authResponse = authResponse.data;

        response = await buildClient({ req }).get(`/api/orders`);
        response = response.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }

    console.log(response);
    return {
        props: {
            orders: response || null,
            currentUser: authResponse.currentUser,
        },
    };
}

export default OrderIndex;
