import { api } from "../src/lib/api";
import { getToken } from "../src/lib/session";
import {
    lastRequest,
    mockFetchOnce,
} from "./helpers/mockFetch";

jest.mock("../src/lib/session", () => ({
    getToken: jest.fn(),
}));

describe("api Authorization header", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("adds Authorization Bearer header when a token exists", async () => {
        (getToken as jest.Mock).mockReturnValue("test-token");

        mockFetchOnce(200, {
            id: 1,
            title: "Test Task",
        });

        await api("/tasks");

        const { init } = lastRequest();

        const headers = init.headers as Record<string, string>;

        expect(headers.Authorization).toBe(
            "Bearer test-token"
        );
    });

    it("does not add Authorization header when no token exists", async () => {
        (getToken as jest.Mock).mockReturnValue(null);

        mockFetchOnce(200, {
            id: 1,
            title: "Test Task",
        });

        await api("/tasks");

        const { init } = lastRequest();

        const headers = init.headers as Record<string, string>;

        expect(headers.Authorization).toBeUndefined();
    });
});