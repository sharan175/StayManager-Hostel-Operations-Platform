
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
} from "../controllers/roomController.js";

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

describe("Room Controller", () => {
  describe("createRoom", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when floor does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = {
        body: { Room_no: 101, floor_no: 1, capacity: 4 },
      };
      const res = mockRes();

      await createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should create room and increment floor room count", async () => {
      const room = { id: 1, room_number: 101, capacity: 4 };

      queryMock
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })
        .mockResolvedValueOnce({ rows: [room] })
        .mockResolvedValueOnce({ rows: [] });

      const req = {
        body: { Room_no: 101, floor_no: 1, capacity: 4 },
      };
      const res = mockRes();

      await createRoom(req, res);

      expect(queryMock).toHaveBeenCalledTimes(3);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(room);
    });

    it("should return 500 when database query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: { Room_no: 101, floor_no: 1, capacity: 4 },
      };
      const res = mockRes();

      await createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteRoom", () => {
    it("should return 400 when room number is missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when room does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = { body: { Room_no: 101 } };
      const res = mockRes();

      await deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete room and decrement floor room count", async () => {
      queryMock
        .mockResolvedValueOnce({
          rows: [{ id: 1, floor_id: 5 }],
        })
        .mockResolvedValueOnce({ rows: [] });

      const req = { body: { Room_no: 101 } };
      const res = mockRes();

      await deleteRoom(req, res);

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Room deleted",
      });
    });
  });

  describe("getRooms", () => {
    it("should return all rooms", async () => {
      const rooms = [{ id: 1, room_number: 101 }];

      queryMock.mockResolvedValueOnce({ rows: rooms });

      const req = {};
      const res = mockRes();

      await getRooms(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: rooms,
      });
    });

    it("should return 500 when fetching rooms fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getRooms(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateRoom", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = { body: { Room_no: 101 } };
      const res = mockRes();

      await updateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when room does not exist", async () => {
      queryMock.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = {
        body: { Room_no: 101, capacity: 5 },
      };
      const res = mockRes();

      await updateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should update room successfully", async () => {
      const room = { id: 1, room_number: 101, capacity: 5 };

      queryMock.mockResolvedValueOnce({
        rowCount: 1,
        rows: [room],
      });

      const req = {
        body: { Room_no: 101, capacity: 5 },
      };
      const res = mockRes();

      await updateRoom(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: room,
        message: "Room updated",
      });
    });

    it("should return 500 when update query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: { Room_no: 101, capacity: 5 },
      };
      const res = mockRes();

      await updateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
