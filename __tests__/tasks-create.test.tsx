
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAuth } from "@/components/useAuth";
import { api } from "@/lib/api";
import TasksPage from "@/app/tasks/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}));

jest.mock("@/components/useAuth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
    api: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedApi = api as jest.Mock;

describe("TasksPage create task", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            token: "test-token",
            isLoading: false,
            signOut: jest.fn(),
        });
    });

    test("puts the new task in the list on a 201", async () => {
        const user = userEvent.setup();

        mockedApi
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce({
                id: 10,
                title: "New Test Task",
                description: "Created from test",
                status: "todo",
                priority: 3,
                project: {
                    id: 16,
                    name: "Week 9 Tasks Project",
                },
                assignee: null,
                dueDate: null,
                createdAt: "2026-08-25T10:00:00.000Z",
                tags: [],
            })
            .mockResolvedValueOnce([
                {
                    id: 10,
                    title: "New Test Task",
                    description: "Created from test",
                    status: "todo",
                    priority: 3,
                    project: {
                        id: 16,
                        name: "Week 9 Tasks Project",
                    },
                    assignee: null,
                    dueDate: null,
                    createdAt: "2026-08-25T10:00:00.000Z",
                    tags: [],
                },
            ]);

        render(<TasksPage />);

        const titleInput = screen.getByPlaceholderText("Task title");
        const descriptionInput =
            screen.getByPlaceholderText("Task description");

        await user.type(titleInput, "New Test Task");
        await user.type(descriptionInput, "Created from test");

        await user.click(
            screen.getByRole("button", {
                name: "Create Task",
            })
        );

        expect(
            await screen.findByText("New Test Task")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Created from test")
        ).toBeInTheDocument();
    });

    test("renders the API field error and keeps entered values on a 400", async () => {
        const user = userEvent.setup();

        mockedApi
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce({
                message: "title must be longer than 3 characters",
                messages: [
                    "title must be longer than 3 characters",
                ],
                status: 400,
            });

        render(<TasksPage />);

        const titleInput = screen.getByPlaceholderText("Task title");
        const descriptionInput =
            screen.getByPlaceholderText("Task description");

        await user.type(titleInput, "abc");
        await user.type(descriptionInput, "Test description");

        await user.click(
            screen.getByRole("button", {
                name: "Create Task",
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "title must be longer than 3 characters"
                )
            ).toBeInTheDocument();
        });

        expect(titleInput).toHaveValue("abc");
        expect(descriptionInput).toHaveValue(
            "Test description"
        );
    });
});
