import "@testing-library/jest-dom";

process.env.NEXT_PUBLIC_API_URL ??= "http://api.test";

beforeEach(() => {
    global.fetch = jest.fn();
    window.localStorage.clear();
});

afterEach(() => {
    jest.resetAllMocks();
});