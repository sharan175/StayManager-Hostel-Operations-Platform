
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import {
  getWardenStats,
  getWardenProfile,
} from "../controllers/wardenStatsController.js";

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

describe("Warden Stats Controller", () => {
  describe("getWardenStats", () => {
    it("should return 404 when warden is not found", async () => {
      queryMock.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return floor statistics successfully", async () => {
      queryMock
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ floor_id: 5 }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: "10" }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: "6" }],
        });

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalRooms: 10,
        occupied: 6,
        vacant: 4,
        complaints: 0,
      });
    });

    it("should return 500 when database query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getWardenProfile", () => {
    it("should return 404 when profile is not found", async () => {
      queryMock.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return warden profile successfully", async () => {
      const user = {
        id: 10,
        name: "John",
        email: "john@example.com",
        floor_number: 1,
      };

      queryMock.mockResolvedValueOnce({
        rowCount: 1,
        rows: [user],
      });

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it("should return 500 when profile query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = { user: { id: 10 } };
      const res = mockRes();

      await getWardenProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
