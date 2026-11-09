
import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from "vitest";


// ==================================================
// 1. CREATE MOCK FUNCTIONS
// ==================================================

// vi.hoisted() creates mock functions before vi.mock() is evaluated.
// queryMock replaces PostgreSQL pool.query().
// hashMock replaces bcrypt.hash().

const { queryMock, hashMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
    hashMock: vi.fn()
}));


// ==================================================
// 2. MOCK POSTGRESQL DATABASE
// ==================================================

// Replace the actual database module with a fake module.
// This prevents tests from connecting to the real database.

vi.mock("../config/db.js", () => ({
    default: {
        query: queryMock
    }
}));


// ==================================================
// 3. MOCK BCRYPT
// ==================================================

// Replace actual bcrypt password hashing with a mock.
// We can control the hashed password returned in tests.

vi.mock("bcrypt", () => ({
    default: {
        hash: hashMock
    }
}));


// ==================================================
// 4. IMPORT ACTUAL CONTROLLER FUNCTIONS
// ==================================================

// Import the real controller functions.
// Only their external dependencies are mocked.

import {
    completeProfile,
    redirectUser
} from "../controllers/authcontroller.js";


// ==================================================
// 5. CREATE HELPER FUNCTION
// ==================================================

// This helper creates fake Express request and response objects.
// We reuse it in multiple test cases to avoid repeating code.

const createMocks = (body = {}) => {

    // Create a fake Express request object.
    const req = {
        body,

        // Simulate the currently authenticated user's ID.
        user: {
            id: 101
        }
    };

    // Create a fake Express response object.
    const res = {

        // Mock status() and allow chaining like res.status().json().
        status: vi.fn().mockReturnThis(),

        // Mock JSON response.
        json: vi.fn(),

        // Mock redirect response.
        redirect: vi.fn()
    };

    // Return both objects.
    return { req, res };
};


// ==================================================
// TEST GROUP 1: completeProfile()
// ==================================================

describe("completeProfile controller", () => {

    // Reset mock call history before every test.
    beforeEach(() => {
        vi.clearAllMocks();
    });


    // TEST 1: NAME IS MISSING
    it("should return 400 when name is missing", async () => {

        // Create request without name.
        const { req, res } = createMocks({
            phone: "9876543210",
            password: "password123"
        });

        // Execute the actual controller.
        await completeProfile(req, res);

        // Check that HTTP 400 is returned.
        expect(res.status).toHaveBeenCalledWith(400);

        // Check the validation error message.
        expect(res.json).toHaveBeenCalledWith({
            message: "Name, phone, and password are required"
        });

        // Database should not be accessed.
        expect(queryMock).not.toHaveBeenCalled();
    });


    // TEST 2: PHONE IS MISSING
    it("should return 400 when phone is missing", async () => {

        // Create request without phone.
        const { req, res } = createMocks({
            name: "Rahul",
            password: "password123"
        });

        // Execute controller.
        await completeProfile(req, res);

        // Verify HTTP 400.
        expect(res.status).toHaveBeenCalledWith(400);

        // Verify database was not accessed.
        expect(queryMock).not.toHaveBeenCalled();
    });


    // TEST 3: PASSWORD IS MISSING
    it("should return 400 when password is missing", async () => {

        // Create request without password.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210"
        });

        // Execute controller.
        await completeProfile(req, res);

        // Verify HTTP 400.
        expect(res.status).toHaveBeenCalledWith(400);

        // Database should not be accessed.
        expect(queryMock).not.toHaveBeenCalled();
    });


    // TEST 4: PROFILE IS ALREADY COMPLETE
    it("should return 403 when profile is already complete", async () => {

        // Create request with all required details.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210",
            password: "password123"
        });

        // Simulate PostgreSQL returning a completed profile.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: "Rahul",
                phone_no: "9876543210",
                password: "existing-hash"
            }]
        });

        // Execute controller.
        await completeProfile(req, res);

        // Verify HTTP 403.
        expect(res.status).toHaveBeenCalledWith(403);

        // Verify the error message.
        expect(res.json).toHaveBeenCalledWith({
            message: "Profile already complete"
        });

        // Password should not be hashed again.
        expect(hashMock).not.toHaveBeenCalled();
    });


    // TEST 5: SUCCESSFUL PROFILE COMPLETION
    it("should update profile and return 200", async () => {

        // Create request with all required details.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210",
            password: "password123"
        });

        // Simulate an incomplete profile from PostgreSQL.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: null,
                phone_no: null,
                password: null
            }]
        });

        // Simulate successful password hashing.
        hashMock.mockResolvedValueOnce("hashed-password");

        // Simulate successful database UPDATE.
        queryMock.mockResolvedValueOnce({
            rows: []
        });

        // Execute controller.
        await completeProfile(req, res);

        // Verify bcrypt was called with password and 10 salt rounds.
        expect(hashMock).toHaveBeenCalledWith(
            "password123",
            10
        );

        // Verify that SELECT and UPDATE queries both executed.
        expect(queryMock).toHaveBeenCalledTimes(2);

        // Verify the UPDATE query and its parameters.
        expect(queryMock).toHaveBeenLastCalledWith(
            expect.stringContaining("UPDATE users"),
            [
                "Rahul",
                "9876543210",
                "hashed-password",
                101
            ]
        );

        // Verify HTTP 200.
        expect(res.status).toHaveBeenCalledWith(200);

        // Verify success response.
        expect(res.json).toHaveBeenCalledWith({
            success: true
        });
    });


    // TEST 6: PASSWORD HASHING VERIFICATION
    it("should store hashed password instead of plain password", async () => {

        // Create request with profile details.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210",
            password: "mypassword"
        });

        // Simulate an incomplete profile.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: null,
                phone_no: null,
                password: null
            }]
        });

        // Simulate bcrypt returning a hashed password.
        hashMock.mockResolvedValueOnce("secure-hash");

        // Simulate successful UPDATE query.
        queryMock.mockResolvedValueOnce({
            rows: []
        });

        // Execute controller.
        await completeProfile(req, res);

        // Get the parameters passed to the second database query.
        const updateParameters = queryMock.mock.calls[1][1];

        // Check that the password parameter contains the hash.
        expect(updateParameters[2]).toBe("secure-hash");

        // Check that the plain password was not stored.
        expect(updateParameters[2]).not.toBe("mypassword");
    });


    // TEST 7: DATABASE SELECT FAILURE
    it("should return 500 when database SELECT fails", async () => {

        // Create request with valid details.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210",
            password: "password123"
        });

        // Simulate PostgreSQL SELECT query failure.
        queryMock.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        // Execute controller.
        await completeProfile(req, res);

        // Verify HTTP 500.
        expect(res.status).toHaveBeenCalledWith(500);

        // Verify error message.
        expect(res.json).toHaveBeenCalledWith({
            error: "Database connection failed"
        });
    });


    // TEST 8: DATABASE UPDATE FAILURE
    it("should return 500 when database UPDATE fails", async () => {

        // Create request with valid details.
        const { req, res } = createMocks({
            name: "Rahul",
            phone: "9876543210",
            password: "password123"
        });

        // Simulate an incomplete profile from SELECT query.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: null,
                phone_no: null,
                password: null
            }]
        });

        // Simulate successful password hashing.
        hashMock.mockResolvedValueOnce("hashed-password");

        // Simulate UPDATE query failure.
        queryMock.mockRejectedValueOnce(
            new Error("Update failed")
        );

        // Execute controller.
        await completeProfile(req, res);

        // Verify HTTP 500.
        expect(res.status).toHaveBeenCalledWith(500);

        // Verify error message.
        expect(res.json).toHaveBeenCalledWith({
            error: "Update failed"
        });
    });

});


// ==================================================
// TEST GROUP 2: redirectUser()
// ==================================================

describe("redirectUser controller", () => {

    // Reset mock call history before every test.
    beforeEach(() => {
        vi.clearAllMocks();
    });


    // TEST 9: USER NOT FOUND
    it("should return 404 when user is not found", async () => {

        // Create fake request and response objects.
        const { req, res } = createMocks();

        // Simulate PostgreSQL returning an empty result.
        queryMock.mockResolvedValueOnce({
            rows: []
        });

        // Execute controller.
        await redirectUser(req, res);

        // Verify HTTP 404.
        expect(res.status).toHaveBeenCalledWith(404);

        // Verify error message.
        expect(res.json).toHaveBeenCalledWith({
            message: "User not found"
        });

        // No redirect should happen.
        expect(res.redirect).not.toHaveBeenCalled();
    });


    // TEST 10: INCOMPLETE PROFILE
    it("should redirect to complete-profile when profile is incomplete", async () => {

        // Create fake request and response objects.
        const { req, res } = createMocks();

        // Simulate a profile with missing required information.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: null,
                phone_no: null,
                password: null,
                google_id: "google123"
            }]
        });

        // Execute controller.
        await redirectUser(req, res);

        // Verify redirect to the complete-profile page.
        expect(res.redirect).toHaveBeenCalledWith(
            "http://localhost:5173/complete-profile"
        );

        // No error status should be returned.
        expect(res.status).not.toHaveBeenCalled();
    });


    // TEST 11: COMPLETED PROFILE
    it("should redirect to home page when profile is complete", async () => {

        // Create fake request and response objects.
        const { req, res } = createMocks();

        // Simulate a completed profile.
        queryMock.mockResolvedValueOnce({
            rows: [{
                name: "Rahul",
                phone_no: "9876543210",
                password: "hashed-password",
                google_id: "google123"
            }]
        });

        // Execute controller.
        await redirectUser(req, res);

        // Verify redirect to the frontend home page.
        expect(res.redirect).toHaveBeenCalledWith(
            "http://localhost:5173/"
        );

        // No error status should be returned.
        expect(res.status).not.toHaveBeenCalled();
    });


    // TEST 12: DATABASE FAILURE
    it("should return 500 when database query fails", async () => {

        // Create fake request and response objects.
        const { req, res } = createMocks();

        // Simulate PostgreSQL connection failure.
        queryMock.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        // Execute controller.
        await redirectUser(req, res);

        // Verify HTTP 500.
        expect(res.status).toHaveBeenCalledWith(500);

        // Verify error response.
        expect(res.json).toHaveBeenCalledWith({
            error: "Database connection failed"
        });

        // No redirect should happen.
        expect(res.redirect).not.toHaveBeenCalled();
    });

});
