import Router from "next/router";
import React, { useState } from "react";
import { useRequest } from "../../hooks/useRequest";
import { useValue } from "../../hooks/useValue";

const New = ({ currentUser }) => {
    const { value: title, onChange: onTitleChange } = useValue("");
    const [price, setPrice] = useState<string>("");
    const { doRequest, errors } = useRequest(
        "/api/tickets",
        "post",
        { title, price },
        () => Router.push("/")
    );

    const onSubmit = (event: React.FocusEvent<HTMLFormElement>) => {
        event.preventDefault();
        doRequest();
    };

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) return;
        setPrice(value.toFixed(2));
    };

    return (
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={onTitleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="">Price</label>
                    <input
                        type="text"
                        className="form-control"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onBlur={onBlur}
                    />
                </div>
                {errors}
                <button className="btn btn-primary mt-3">Submit</button>
            </form>
        </div>
    );
};

export default New;
