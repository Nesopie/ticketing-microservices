import React from "react";
import Header from "./Header";

const BaseLayout = ({ children, currentUser }) => {
    return (
        <div className="container">
            <Header currentUser={currentUser} />
            {children}
        </div>
    );
};

export default BaseLayout;
