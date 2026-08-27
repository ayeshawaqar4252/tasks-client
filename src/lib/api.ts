import { getToken } from "./session";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
    status: number;
    messages: string[];
    error: string;
    timestamp: string;
    path: string;

    constructor(
        status: number,
        messages: string[],
        error: string,
        timestamp: string,
        path: string
    ) {
        super(messages.join(", "));
        this.status = status;
        this.messages = messages;
        this.error = error;
        this.timestamp = timestamp;
        this.path = path;
    }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken();

const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
        ...init?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
});

   if (!response.ok) {
    const errorBody = await response.json();

    throw new ApiError(
        response.status,
        Array.isArray(errorBody.message)
            ? errorBody.message
            : [errorBody.message || "API request failed"],
        errorBody.error || "Unknown Error",
        errorBody.timestamp || "",
        errorBody.path || path
    );
}

    if (response.status === 204) {
    return undefined as T;
}

const text = await response.text();

if (!text) {
    return undefined as T;
}

return JSON.parse(text);
}