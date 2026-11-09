
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database query function.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Mock the database module.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import the actual controller.
import { allocation } from "../controllers/allocationcheckController.js";

// Create reusable request and response objects.
const createMocks = (userId = 10) => {
    const req = {
        user: {
            id: userId
        }
    };

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
// TEST allocation()
// =====================================================

describe("allocation", () => {

    // Test when student does not exist.
    it("should return 404 when student is not found", async () => {

        const { req, res } = createMocks(10);

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await allocation(req, res);

        expect(queryMock).toHaveBeenCalledTimes(1);

        expect(queryMock.mock.calls[0][1]).toEqual([10]);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            message: "Student not found"
        });
    });


    // Test when student exists but has no room allocation.
    it("should return no room found when allocation does not exist", async () => {

        const { req, res } = createMocks(10);

        queryMock
            // Find the student.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        id: 5,
                        fees_paid: true
                    }
                ]
            })

            // Find the student's room allocation.
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            });

        await allocation(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        expect(res.json).toHaveBeenCalledWith({
            message: "no room found"
        });
    });


    // Test successful allocation retrieval.
    it("should return student allocation details successfully", async () => {

        const { req, res } = createMocks(10);

        queryMock
            // Return student details.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        id: 5,
                        fees_paid: true
                    }
                ]
            })

            // Return room allocation details.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        floor_number: 2,
                        room_number: 205
                    }
                ]
            });

        await allocation(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        // Verify user ID is passed to both queries.
        expect(queryMock.mock.calls[0][1]).toEqual([10]);
        expect(queryMock.mock.calls[1][1]).toEqual([10]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaints fetched successfully",
            fees_paid: true,
            floor: 2,
            rooms: 205
        });
    });


    // Test when student has not paid fees.
    it("should return fees_paid as false when fees are unpaid", async () => {

        const { req, res } = createMocks(15);

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        id: 8,
                        fees_paid: false
                    }
                ]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        floor_number: 1,
                        room_number: 101
                    }
                ]
            });

        await allocation(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaints fetched successfully",
            fees_paid: false,
            floor: 1,
            rooms: 101
        });
    });


    // Test database failure during the student query.
    it("should return 500 when database query fails", async () => {

        const { req, res } = createMocks(10);

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await allocation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });


    // Test database failure during the allocation query.
    it("should return 500 when allocation query fails", async () => {

        const { req, res } = createMocks(10);

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        id: 5,
                        fees_paid: true
                    }
                ]
            })
            .mockRejectedValueOnce(
                new Error("Allocation query failed")
            );

        await allocation(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Allocation query failed"
        });
    });

});
