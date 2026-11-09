
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import {
  createFloor,
  deleteFloor,
  getFloors,
  updateFloor,
} from "../controllers/floorController.js";

const queryMock = pool.query;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  queryMock.mockReset();
});

describe("Floor Controller", () => {
  describe("createFloor", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await createFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should create a floor successfully", async () => {
      const floor = { id: 1, floor_number: 1, name: "First Floor" };

      queryMock.mockResolvedValueOnce({
        rows: [floor],
      });

      const req = {
        body: { floor: 1, name: "First Floor" },
      };
      const res = mockRes();

      await createFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: floor,
        message: "Floor created successfully",
      });
    });

    it("should return 409 when floor already exists", async () => {
      queryMock.mockRejectedValueOnce({ code: "23505" });

      const req = {
        body: { floor: 1, name: "First Floor" },
      };
      const res = mockRes();

      await createFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return 500 for other database errors", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: { floor: 1, name: "First Floor" },
      };
      const res = mockRes();

      await createFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteFloor", () => {
    it("should return 400 when floor number is missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await deleteFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when floor does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = { body: { floor: 1 } };
      const res = mockRes();

      await deleteFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete a floor successfully", async () => {
      queryMock.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const req = { body: { floor: 1 } };
      const res = mockRes();

      await deleteFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Floor deleted successfully",
      });
    });
  });

  describe("getFloors", () => {
    it("should return all floors", async () => {
      const floors = [{ id: 1, name: "First Floor" }];

      queryMock.mockResolvedValueOnce({ rows: floors });

      const req = {};
      const res = mockRes();

      await getFloors(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: floors,
      });
    });

    it("should return 500 when fetching floors fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getFloors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateFloor", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = { body: { floor: 1 } };
      const res = mockRes();

      await updateFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when floor does not exist", async () => {
      queryMock.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = {
        body: { floor: 1, name: "Updated Floor" },
      };
      const res = mockRes();

      await updateFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should update a floor successfully", async () => {
      const floor = { id: 1, name: "Updated Floor" };

      queryMock.mockResolvedValueOnce({
        rowCount: 1,
        rows: [floor],
      });

      const req = {
        body: { floor: 1, name: "Updated Floor" },
      };
      const res = mockRes();

      await updateFloor(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: floor,
        message: "Floor updated",
      });
    });

    it("should return 500 when update query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: { floor: 1, name: "Updated Floor" },
      };
      const res = mockRes();

      await updateFloor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
