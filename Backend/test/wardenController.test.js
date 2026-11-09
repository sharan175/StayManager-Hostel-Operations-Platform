
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import {
  makeWarden,
  removeWarden,
  getWarden,
} from "../controllers/wardenController.js";

const queryMock = pool.query;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  queryMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Warden Controller", () => {
  describe("makeWarden", () => {
    it("should return 400 when email or floor is missing", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockRes();

      await makeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when user does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const req = {
        body: { email: "test@example.com", floor: 1 },
      };
      const res = mockRes();

      await makeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 when user is already a warden", async () => {
      queryMock
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 10 }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{}] });

      const req = {
        body: { email: "test@example.com", floor: 1 },
      };
      const res = mockRes();

      await makeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when floor does not exist", async () => {
      queryMock
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 10 }],
        })
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const req = {
        body: { email: "test@example.com", floor: 1 },
      };
      const res = mockRes();

      await makeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should assign a user as warden successfully", async () => {
      const user = { id: 10, email: "test@example.com" };

      queryMock
        .mockResolvedValueOnce({ rowCount: 1, rows: [user] })
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 5 }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [] });

      const req = {
        body: { email: " TEST@EXAMPLE.COM ", floor: 1 },
      };
      const res = mockRes();

      await makeWarden(req, res);

      expect(queryMock).toHaveBeenLastCalledWith(
        expect.stringContaining("INSERT INTO wardens"),
        [10, 5]
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User assigned as warden",
        user,
      });
    });

    it("should return 500 when database query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: { email: "test@example.com", floor: 1 },
      };
      const res = mockRes();

      await makeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("removeWarden", () => {
    it("should return 400 when email is missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await removeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when user does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const req = { body: { email: "test@example.com" } };
      const res = mockRes();

      await removeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 when user is not a warden", async () => {
      queryMock
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 10 }],
        })
        .mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const req = { body: { email: "test@example.com" } };
      const res = mockRes();

      await removeWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should remove warden successfully", async () => {
      queryMock
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 10 }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{}] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [] });

      const req = { body: { email: "test@example.com" } };
      const res = mockRes();

      await removeWarden(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Warden role removed",
      });
    });
  });

  describe("getWarden", () => {
    it("should return the warden list", async () => {
      const wardens = [{ name: "John", email: "john@example.com" }];

      queryMock.mockResolvedValueOnce({
        rows: wardens,
      });

      const req = {};
      const res = mockRes();

      await getWarden(req, res);

      expect(res.json).toHaveBeenCalledWith({ list: wardens });
    });

    it("should return 500 when database query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getWarden(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
