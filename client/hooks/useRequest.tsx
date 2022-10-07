import axios, { AxiosError } from "axios";
import { useState } from "react";

export const useRequest = <T extends {}>(
    url: string,
    method: "get" | "post" | "patch" | "delete",
    body: any,
    onSuccess: (...args) => void
) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        setErrors(null);
        try {
            const response = await axios[method]<T>(url, { ...body, ...props });
            onSuccess(response.data);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setErrors(
                    <div className="alert alert-danger">
                        <h4>Oops!</h4>
                        <ul className="my-o">
                            {err.response.data.errors.map((err) => (
                                <li key={err.message}>{err.message}</li>
                            ))}
                        </ul>
                    </div>
                );
            }
        }
    };

    return { doRequest, errors };
};
