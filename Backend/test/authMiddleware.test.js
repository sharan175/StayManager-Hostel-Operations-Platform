
// Import testing functions from Vitest
import { describe, it, expect, vi } from "vitest";

// Import the actual middleware from our application
import { isAuth } from "../middleware/authMiddleware.js";


// describe() groups related test cases together
describe("isAuth middleware", () => {


    // TEST CASE 1:
    // Check what happens when the user is NOT logged in

    it("should return 401 when user is not authenticated", () => {

        // Create a fake request object
        // isAuthenticated() returns false, meaning the user is not logged in
        const req = {
            isAuthenticated: () => false
        };


        // Create a fake response object
        const res = {

            // vi.fn() creates a mock function
            // mockReturnThis() allows chaining:
            // res.status(401).json(...)
            status: vi.fn().mockReturnThis(),

            // Mock json() so we can check whether it was called
            json: vi.fn()
        };


        // Create a fake next() function
        // We want to check whether the middleware calls next()
        const next = vi.fn();


        // Execute the actual middleware using our fake objects
        isAuth(req, res, next);


        // ASSERTIONS: Check whether the middleware behaved correctly

        // Check whether status() was called with HTTP 401
        expect(res.status).toHaveBeenCalledWith(401);

        // Check whether the correct error message was returned
        expect(res.json).toHaveBeenCalledWith({
            message: "Login required"
        });

        // An unauthenticated user should NOT proceed
        expect(next).not.toHaveBeenCalled();

    });



    // TEST CASE 2:
    // Check what happens when the user IS logged in

    it("should call next when user is authenticated", () => {

        // Create a fake request object
        // This time authentication returns true
        const req = {
            isAuthenticated: () => true
        };


        // Create fake response methods
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };


        // Create a mock next() function
        const next = vi.fn();


        // Execute the actual middleware
        isAuth(req, res, next);


        // ASSERTIONS

        // Authenticated users should proceed to the next middleware
        // Check that next() was called exactly once
        expect(next).toHaveBeenCalledTimes(1);

        // No unauthorized response should be sent
        expect(res.status).not.toHaveBeenCalled();

        // No error JSON should be sent
        expect(res.json).not.toHaveBeenCalled();

    });

});
