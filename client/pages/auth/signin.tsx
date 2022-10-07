import React from "react";
import Router from "next/router";
import { useValue } from "../../hooks/useValue";
import { useRequest } from "../../hooks/useRequest";

const signup = () => {
    const { value: email, onChange: onEmailChange } = useValue("");
    const { value: password, onChange: onPasswordChange } = useValue("");
    const { doRequest, errors } = useRequest<{ email: string; id: string }>(
        "/api/users/signin",
        "post",
        {
            email,
            password,
        },
        () => Router.push("/")
    );
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        doRequest();
    };

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign in</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    className="form-control"
                    value={email}
                    onChange={onEmailChange}
                />
            </div>
            <div className="form-group mr-1">
                <label>Password</label>
                <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={onPasswordChange}
                />
            </div>
            {errors}
            <button className="btn btn-primary mt-2">Sign in</button>
        </form>
    );
};

export default signup;
