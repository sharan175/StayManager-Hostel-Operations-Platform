
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database query function.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Mock PostgreSQL database.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import actual controller functions.
import {
    makeStudent,
    getStudent,
    removeStudent
} from "../controllers/studentController.js";

// Create reusable request and response objects.
const createMocks = (body = {}) => {
    const req = { body };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    return { req, res };
};

// Reset mocks before every test.
beforeEach(() => {
    queryMock.mockReset();

    vi.restoreAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});
});


// =====================================================
// 1. TEST makeStudent()
// =====================================================

describe("makeStudent", () => {

    // Test missing email.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await makeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required"
        });

        expect(queryMock).not.toHaveBeenCalled();
    });

    // Test user not found.
    it("should return 404 when user is not found", async () => {
        const { req, res } = createMocks({
            email: "unknown@gmail.com"
        });

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await makeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test user already assigned as student.
    it("should return 400 when user is already a student", async () => {
        const { req, res } = createMocks({
            email: "student@gmail.com"
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10, email: "student@gmail.com" }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ user_id: 10 }]
            });

        await makeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Already a student"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful student assignment.
    it("should assign the user as a student successfully", async () => {
        const user = {
            id: 10,
            email: "student@gmail.com"
        };

        const { req, res } = createMocks({
            email: "student@gmail.com"
        });

        queryMock
            // Find the user.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [user]
            })
            // Check existing student role.
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            // Insert student role.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeStudent(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "User assigned as student",
            user
        });
    });

    // Test email normalization.
    it("should convert email to lowercase and trim spaces", async () => {
        const { req, res } = createMocks({
            email: "  STUDENT@GMAIL.COM  "
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10 }]
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeStudent(req, res);

        expect(queryMock.mock.calls[0][1]).toEqual([
            "student@gmail.com"
        ]);
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "student@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await makeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 2. TEST getStudent()
// =====================================================

describe("getStudent", () => {

    // Test successful student retrieval.
    it("should return all students successfully", async () => {
        const students = [
            {
                id: 1,
                name: "Rahul",
                email: "rahul@gmail.com"
            },
            {
                id: 2,
                name: "Arun",
                email: "arun@gmail.com"
            }
        ];

        const { req, res } = createMocks();

        queryMock.mockResolvedValueOnce({
            rowCount: 2,
            rows: students
        });

        await getStudent(req, res);

        expect(queryMock).toHaveBeenCalledTimes(1);

        expect(res.json).toHaveBeenCalledWith({
            message: "Students fetched successfully",
            students
        });
    });

    // Test when no students exist.
    it("should return an empty student list", async () => {
        const { req, res } = createMocks();

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await getStudent(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: "Students fetched successfully",
            students: []
        });
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks();

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await getStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 3. TEST removeStudent()
// =====================================================

describe("removeStudent", () => {

    // Test missing email.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await removeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required"
        });

        expect(queryMock).not.toHaveBeenCalled();
    });

    // Test user not found.
    it("should return 404 when user is not found", async () => {
        const { req, res } = createMocks({
            email: "unknown@gmail.com"
        });

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await removeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test user is not a student.
    it("should return 400 when user is not a student", async () => {
        const { req, res } = createMocks({
            email: "user@gmail.com"
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 20 }]
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            });

        await removeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "User is not a student"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful student removal.
    it("should remove student successfully", async () => {
        const { req, res } = createMocks({
            email: "student@gmail.com"
        });

        queryMock
            // Find user.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10 }]
            })
            // Confirm student role exists.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ user_id: 10 }]
            })
            // Delete student role.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await removeStudent(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Student removed successfully"
        });
    });

    // Test email normalization.
    it("should normalize email before querying", async () => {
        const { req, res } = createMocks({
            email: "  STUDENT@GMAIL.COM  "
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10 }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ user_id: 10 }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await removeStudent(req, res);

        expect(queryMock.mock.calls[0][1]).toEqual([
            "student@gmail.com"
        ]);
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "student@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await removeStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});
