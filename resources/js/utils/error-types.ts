export type axiosErrorType = {
    response: {
        status: number;
        errors: {
            [key: string]: string[];
        };
    };
};

export type errorDataType = {
    message: string;
    errors: {
        [key: string]: string[];
    };
};
