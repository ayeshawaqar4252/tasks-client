
import { render, screen } from "@testing-library/react";
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

describe("TasksPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            token: "test-token",
            isLoading: false,
            signOut: jest.fn(),
        });
    });

    test("renders one row for each task", async () => {
        mockedApi.mockResolvedValueOnce([
            {
                id: 1,
                title: "Task One",
                description: "First task",
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
            {
                id: 2,
                title: "Task Two",
                description: "Second task",
                status: "done",
                priority: 1,
                project: {
                    id: 16,
                    name: "Week 9 Tasks Project",
                },
                assignee: null,
                dueDate: null,
                createdAt: "2026-08-25T10:01:00.000Z",
                tags: [],
            },
        ]);

        render(<TasksPage />);

        expect(
            await screen.findByText("Task One")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Task Two")
        ).toBeInTheDocument();

        expect(
            screen.getByText("First task")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Second task")
        ).toBeInTheDocument();
    });

    test("renders the empty state when API returns an empty list", async () => {
        mockedApi.mockResolvedValueOnce([]);

        render(<TasksPage />);

        expect(
            await screen.findByText("No tasks found")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Try another status filter or create a new task."
            )
        ).toBeInTheDocument();
    });
});
