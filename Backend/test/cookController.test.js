
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database query function.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Mock the PostgreSQL database module.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import actual controller functions.
import {
    makeCook,
    removeCook,
    getCook
} from "../controllers/cookController.js";

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
// 1. TEST makeCook()
// =====================================================

describe("makeCook", () => {

    // Test missing email.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await makeCook(req, res);

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

        await makeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test when user is already a cook.
    it("should return 400 when user is already a cook", async () => {
        const { req, res } = createMocks({
            email: "cook@gmail.com"
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10, email: "cook@gmail.com" }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ user_id: 10 }]
            });

        await makeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Already cook"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful cook assignment.
    it("should assign the user as cook successfully", async () => {
        const user = {
            id: 10,
            email: "cook@gmail.com"
        };

        const { req, res } = createMocks({
            email: "cook@gmail.com"
        });

        queryMock
            // Find the user.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [user]
            })
            // Check whether the user is already a cook.
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            // Insert the cook role.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeCook(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "User assigned as cook",
            user
        });
    });

    // Test email normalization.
    it("should convert email to lowercase and trim spaces", async () => {
        const { req, res } = createMocks({
            email: "  COOK@GMAIL.COM  "
        });

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 10, email: "cook@gmail.com" }]
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await makeCook(req, res);

        expect(queryMock.mock.calls[0][1]).toEqual([
            "cook@gmail.com"
        ]);
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "cook@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await makeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 2. TEST removeCook()
// =====================================================

describe("removeCook", () => {

    // Test missing email.
    it("should return 400 when email is missing", async () => {
        const { req, res } = createMocks({});

        await removeCook(req, res);

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

        await removeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });
    });

    // Test when user does not have a cook role.
    it("should return 400 when user is not a cook", async () => {
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

        await removeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "User is not cook"
        });

        expect(queryMock).toHaveBeenCalledTimes(2);
    });

    // Test successful cook removal.
    it("should remove cook role successfully", async () => {
        const { req, res } = createMocks({
            email: "cook@gmail.com"
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

        await removeCook(req, res);

        expect(queryMock).toHaveBeenCalledTimes(3);

        expect(queryMock.mock.calls[2][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Cook role removed"
        });
    });

    // Test email normalization.
    it("should normalize email before querying", async () => {
        const { req, res } = createMocks({
            email: "  COOK@GMAIL.COM  "
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

        await removeCook(req, res);

        expect(queryMock.mock.calls[0][1]).toEqual([
            "cook@gmail.com"
        ]);
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            email: "cook@gmail.com"
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await removeCook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 3. TEST getCook()
// =====================================================

describe("getCook", () => {

    // Test successful retrieval of cooks.
    it("should return the list of cooks", async () => {
        const cooks = [
            {
                name: "Ravi",
                email: "ravi@gmail.com"
            },
            {
                name: "Kiran",
                email: "kiran@gmail.com"
            }
        ];

        const { req, res } = createMocks();

        queryMock.mockResolvedValueOnce({
            rowCount: 2,
            rows: cooks
        });

        await getCook(req, res);

        expect(queryMock).toHaveBeenCalledTimes(1);

        expect(res.json).toHaveBeenCalledWith({
            list: cooks
        });
    });

    // Test when no cooks are available.
    it("should return an empty list when no cooks exist", async () => {
        const { req, res } = createMocks();

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await getCook(req, res);

        expect(res.json).toHaveBeenCalledWith({
            list: []
        });
    });

    // Test database failure.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks();

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await getCook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});
