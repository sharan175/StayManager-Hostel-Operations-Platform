
import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock database query function.
const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}));

// Mock the database module so tests never access the real database.
vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));

// Import the actual controller functions.
import {
    submitComplaint,
    getComplaints,
    getWardenComplaints,
    resolveComplaint
} from "../controllers/complaintsController.js";

// Create reusable fake request and response objects.
const createMocks = ({
    user = { id: 101 },
    body = {},
    params = {},
    file = null
} = {}) => {
    const req = {
        user,
        body,
        params,
        file
    };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    return { req, res };
};

// Reset mock calls before every test.
beforeEach(() => {
    vi.clearAllMocks();
});


// =====================================================
// 1. TEST submitComplaint()
// =====================================================

describe("submitComplaint", () => {

    // Test that title and description are required.
    it("should return 400 when title is missing", async () => {
        const { req, res } = createMocks({
            body: { description: "Water leakage" }
        });

        await submitComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Title and description are required"
        });

        // Database should not be queried for invalid input.
        expect(queryMock).not.toHaveBeenCalled();
    });

    // Test that the student must exist before submitting a complaint.
    it("should return 404 when student is not found", async () => {
        const { req, res } = createMocks({
            body: {
                title: "Water problem",
                description: "No water in the bathroom"
            }
        });

        // Simulate no student being found.
        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await submitComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Student not found"
        });

        expect(queryMock).toHaveBeenCalledOnce();
    });

    // Test successful complaint submission without an image.
    it("should submit a complaint successfully without an image", async () => {
        const { req, res } = createMocks({
            body: {
                title: "Water problem",
                description: "No water in the bathroom"
            }
        });

        const complaint = {
            id: 1,
            title: "Water problem",
            description: "No water in the bathroom",
            image_url: null
        };

        // First query finds the student.
        // Second query inserts the complaint.
        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 50 }]
            })
            .mockResolvedValueOnce({
                rows: [complaint]
            });

        await submitComplaint(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        expect(queryMock.mock.calls[1][1]).toEqual([
            50,
            "Water problem",
            "No water in the bathroom",
            null
        ]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaint submitted successfully",
            complaint
        });
    });

    // Test successful complaint submission with an uploaded image.
    it("should include the uploaded image URL", async () => {
        const { req, res } = createMocks({
            body: {
                title: "Broken light",
                description: "The room light is not working"
            },
            file: {
                filename: "complaint.jpg"
            }
        });

        const complaint = {
            id: 2,
            title: "Broken light",
            image_url: "/uploads/complaint.jpg"
        };

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 60 }]
            })
            .mockResolvedValueOnce({
                rows: [complaint]
            });

        await submitComplaint(req, res);

        // Verify that the uploaded image path is stored.
        expect(queryMock.mock.calls[1][1][3]).toBe(
            "/uploads/complaint.jpg"
        );

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaint submitted successfully",
            complaint
        });
    });

    // Test database failure during complaint submission.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks({
            body: {
                title: "Water problem",
                description: "Water is unavailable"
            }
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await submitComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 2. TEST getComplaints()
// =====================================================

describe("getComplaints", () => {

    // Test when the logged-in user is not a registered student.
    it("should return 404 when student is not found", async () => {
        const { req, res } = createMocks();

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await getComplaints(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Student not found"
        });
    });

    // Test fetching all complaints belonging to a student.
    it("should return the student's complaints", async () => {
        const { req, res } = createMocks();

        const complaints = [
            { id: 1, title: "Water problem" },
            { id: 2, title: "Broken fan" }
        ];

        queryMock
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 50 }]
            })
            .mockResolvedValueOnce({
                rows: complaints
            });

        await getComplaints(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        expect(queryMock.mock.calls[1][1]).toEqual([50]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaints fetched successfully",
            complaints
        });
    });

    // Test database failure while retrieving complaints.
    it("should return 500 when fetching complaints fails", async () => {
        const { req, res } = createMocks();

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await getComplaints(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 3. TEST getWardenComplaints()
// =====================================================

describe("getWardenComplaints", () => {

    // Test that the warden receives complaints assigned to their floor.
    it("should return complaints for the warden", async () => {
        const { req, res } = createMocks();

        const complaints = [
            {
                id: 1,
                title: "Water leakage",
                status: false
            }
        ];

        queryMock.mockResolvedValueOnce({
            rows: complaints
        });

        await getWardenComplaints(req, res);

        expect(queryMock).toHaveBeenCalledOnce();

        expect(queryMock.mock.calls[0][1]).toEqual([101]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaints fetched successfully",
            complaints
        });
    });

    // Test database failure while fetching warden complaints.
    it("should return 500 when database query fails", async () => {
        const { req, res } = createMocks();

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await getWardenComplaints(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });
});


// =====================================================
// 4. TEST resolveComplaint()
// =====================================================

describe("resolveComplaint", () => {

    // Test that a warden cannot resolve a complaint outside their floor.
    it("should return 403 when warden is not authorized", async () => {
        const { req, res } = createMocks({
            params: { id: "25" }
        });

        queryMock.mockResolvedValueOnce({
            rowCount: 0,
            rows: []
        });

        await resolveComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            message: "Not authorized to resolve this complaint"
        });

        // The complaint should not be updated.
        expect(queryMock).toHaveBeenCalledOnce();
    });

    // Test successful complaint resolution.
    it("should resolve the complaint when warden is authorized", async () => {
        const { req, res } = createMocks({
            params: { id: "25" }
        });

        queryMock
            // First query verifies the warden's access.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 25 }]
            })
            // Second query updates the complaint status.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: []
            });

        await resolveComplaint(req, res);

        expect(queryMock).toHaveBeenCalledTimes(2);

        expect(queryMock.mock.calls[1][1]).toEqual(["25"]);

        expect(res.json).toHaveBeenCalledWith({
            message: "Complaint marked as resolved"
        });
    });

    // Test database failure during the authorization query.
    it("should return 500 when authorization query fails", async () => {
        const { req, res } = createMocks({
            params: { id: "25" }
        });

        queryMock.mockRejectedValueOnce(
            new Error("Database failure")
        );

        await resolveComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database failure"
        });
    });

    // Test database failure while updating the complaint.
    it("should return 500 when complaint update fails", async () => {
        const { req, res } = createMocks({
            params: { id: "25" }
        });

        queryMock
            // Warden is authorized.
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 25 }]
            })
            // Updating the complaint fails.
            .mockRejectedValueOnce(
                new Error("Update failed")
            );

        await resolveComplaint(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Update failed"
        });
    });
});
