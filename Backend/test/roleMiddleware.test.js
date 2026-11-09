
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database function that can be controlled in each test.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Replace the actual database module with our mock.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import the middleware after mocking the database.
import { attachRole } from "../middleware/roleMiddleware.js";

// Create fake request and response objects for testing.
const createMocks = (user = { id: 101 }) => {
    const req = { user };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    const next = vi.fn();

    return { req, res, next };
};

// Reset mock history before every test.
beforeEach(() => {
    vi.clearAllMocks();
});

describe("attachRole middleware", () => {

    // TEST 1: If req.user is missing, continue without querying the database.
    it("should call next when user is missing", async () => {
        const { req, res, next } = createMocks(null);

        await attachRole(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(queryMock).not.toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // TEST 2: If the user exists in admins, assign the admin role.
    it("should assign admin role when user is an admin", async () => {
        const { req, next } = createMocks();

        // The admin table contains this user.
        queryMock.mockResolvedValueOnce({ rowCount: 1 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("admin");
        expect(next).toHaveBeenCalledOnce();

        // No need to check other role tables after finding an admin.
        expect(queryMock).toHaveBeenCalledOnce();
    });

    // TEST 3: If not an admin but found in cooks, assign cook.
    it("should assign cook role when user is a cook", async () => {
        const { req, next } = createMocks();

        // Admin check fails; cook check succeeds.
        queryMock
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 1 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("cook");
        expect(next).toHaveBeenCalledOnce();
        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // TEST 4: If not an admin or cook but found in wardens, assign warden.
    it("should assign warden role when user is a warden", async () => {
        const { req, next } = createMocks();

        // Admin and cook checks fail; warden check succeeds.
        queryMock
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 1 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("warden");
        expect(next).toHaveBeenCalledOnce();
        expect(queryMock).toHaveBeenCalledTimes(3);
    });

    // TEST 5: If found in students after the previous checks, assign student.
    it("should assign student role when user is a student", async () => {
        const { req, next } = createMocks();

        // Admin, cook and warden checks fail; student check succeeds.
        queryMock
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 1 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("student");
        expect(next).toHaveBeenCalledOnce();
        expect(queryMock).toHaveBeenCalledTimes(4);
    });

    // TEST 6: If the user is not found in any role table, assign "user".
    it("should assign user role when no matching role exists", async () => {
        const { req, next } = createMocks();

        // All four role-table checks return no matching record.
        queryMock
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockResolvedValueOnce({ rowCount: 0 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("user");
        expect(next).toHaveBeenCalledOnce();
        expect(queryMock).toHaveBeenCalledTimes(4);
    });

    // TEST 7: If a user exists in multiple role tables, the first role wins.
    it("should prioritize admin over other roles", async () => {
        const { req, next } = createMocks();

        // The admin check succeeds, so later tables are never checked.
        queryMock.mockResolvedValueOnce({ rowCount: 1 });

        await attachRole(req, {}, next);

        expect(req.user.role).toBe("admin");
        expect(queryMock).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledOnce();
    });

    // TEST 8: If a database query fails, return a 500 response.
    it("should return 500 when a database error occurs", async () => {
        const { req, res, next } = createMocks();

        // Simulate a database failure during the admin query.
        queryMock.mockRejectedValueOnce(new Error("Database connection failed"));

        await attachRole(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database error"
        });

        // The middleware should not continue after the error.
        expect(next).not.toHaveBeenCalled();
    });

});
