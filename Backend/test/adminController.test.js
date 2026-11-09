
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database query function.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Mock the database module.
// This prevents tests from accessing the actual PostgreSQL database.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import the actual admin controller functions.
import {
    makeAdmin,
    removeAdmin
} from "../controllers/adminController.js";

// Create reusable fake request and response objects.
const createMocks = (body = {}) => {
    const req = { body };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    return { req, res };
};

// Reset all mocks before every test.
beforeEach(() => {
    // Reset call history and queued mock responses.
    queryMock.mockReset();

    // Restore previous spies.
    vi.restoreAllMocks();

    // Suppress expected console.error messages.
    vi.spyOn(console, "error").mockImplementation(() => {});
});


// =====================================================
// 1. TEST makeAdmin()
// =====================================================

describe("makeAdmin", () => {

    // Test when email is missing.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await makeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required"
        });

        expect(queryMock).not.toHaveBeenCalled();
    });

    // Test when the supplied email does not exist.
    it("should return 404 when user is not found", async () => {
        const { req, res } = createMocks({
            email: "unknown@gmail.com"
        });

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await makeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test when the user is already an admin.
    it("should return 400 when user is already an admin", async () => {
        const { req, res } = createMocks({
            email: "admin@gmail.com"
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10, email: "admin@gmail.com" }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ user_id: 10 }]
            });

        await makeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Already admin"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful admin promotion.
    it("should promote the user to admin successfully", async () => {
        const user = {
            id: 10,
            email: "admin@gmail.com"
        };

        const { req, res } = createMocks({
            email: "admin@gmail.com"
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [user]
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeAdmin(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "User promoted to admin",
            user
        });
    });

    // Test email normalization.
    it("should convert email to lowercase and trim spaces", async () => {
        const { req, res } = createMocks({
            email: "  ADMIN@GMAIL.COM  "
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10, email: "admin@gmail.com" }]
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeAdmin(req, res);

        expect(queryMock.mock.calls[0][1]).toEqual([
            "admin@gmail.com"
        ]);
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "admin@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await makeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 2. TEST removeAdmin()
// =====================================================

describe("removeAdmin", () => {

    // Test when email is missing.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await removeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Email is required"
        });

        expect(queryMock).not.toHaveBeenCalled();
    });

    // Test when user does not exist.
    it("should return 404 when user is not found", async () => {
        const { req, res } = createMocks({
            email: "unknown@gmail.com"
        });

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await removeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test when user does not have an admin role.
    it("should return 400 when user is not an admin", async () => {
        const { req, res } = createMocks({
            email: "student@gmail.com"
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

        await removeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "User is not admin"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful admin removal.
    it("should remove admin role successfully", async () => {
        const { req, res } = createMocks({
            email: "admin@gmail.com"
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

        await removeAdmin(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Admin role removed"
        });
    });

    // Test database failure during admin removal.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "admin@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await removeAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});
