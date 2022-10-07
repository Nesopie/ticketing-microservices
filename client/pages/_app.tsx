import "bootstrap/dist/css/bootstrap.css";

import React from "react";
import type { AppProps } from "next/app";
import { buildClient } from "../api/build-client";
import BaseLayout from "../components/BaseLayout";

interface IAppProps extends AppProps {
    currentUser: any;
}

function AppComponent({ Component, pageProps, currentUser }: IAppProps) {
    return (
        <Component
            currentUser={currentUser}
            {...pageProps}
        />
    );
}

export default AppComponent;
