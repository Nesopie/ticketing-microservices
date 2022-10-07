import Router from "next/router";
import React, { useEffect } from "react";
import { useRequest } from "../../hooks/useRequest";

const Signout = () => {
    const { doRequest } = useRequest("/api/users/signout", "post", {}, () =>
        Router.push("/")
    );

    useEffect(() => {
        doRequest();
    }, []);

    return <div>Signout you out...</div>;
};

export default Signout;
