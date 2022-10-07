import React, { useState } from "react";

export const useValue = (initialState: string) => {
    const [value, setValue] = useState<string>(initialState);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setValue(event.target.value);
    };

    return { value, onChange };
};
