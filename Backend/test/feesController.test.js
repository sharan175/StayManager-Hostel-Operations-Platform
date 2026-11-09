
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

import pool from "../config/db.js";
import {
  payFees,
  getAllFees,
  allocateRoom,
} from "../controllers/feesController.js";

const queryMock = pool.query;
const connectMock = pool.connect;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

let client;

beforeEach(() => {
  queryMock.mockReset();
  connectMock.mockReset();

  client = {
    query: vi.fn(),
    release: vi.fn(),
  };

  connectMock.mockResolvedValue(client);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Fees Controller", () => {
  describe("payFees", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = {
        user: { id: 10 },
        body: {},
      };
      const res = mockRes();

      await payFees(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 404 when room does not exist", async () => {
      client.query.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = {
        user: { id: 10 },
        body: { room_id: 1, months_paid: 3, amount: 15000 },
      };
      const res = mockRes();

      await payFees(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 400 when room is unavailable", async () => {
      client.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, is_available: false }],
      });

      const req = {
        user: { id: 10 },
        body: { room_id: 1, months_paid: 3, amount: 15000 },
      };
      const res = mockRes();

      await payFees(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 400 when student already has an allocation", async () => {
      client.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 1, is_available: true }],
        })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{}],
        });

      const req = {
        user: { id: 10 },
        body: { room_id: 1, months_paid: 3, amount: 15000 },
      };
      const res = mockRes();

      await payFees(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(client.release).toHaveBeenCalled();
    });

    it("should process payment and allocate room successfully", async () => {
      client.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 1, is_available: true }],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        })
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 50 }],
        }) // Insert fees
        .mockResolvedValueOnce({ rows: [] }) // Insert allocation
        .mockResolvedValueOnce({ rows: [] }) // Update room
        .mockResolvedValueOnce({ rows: [] }) // Update student
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const req = {
        user: { id: 10 },
        body: { room_id: 1, months_paid: 3, amount: 15000 },
      };
      const res = mockRes();

      await payFees(req, res);

      expect(client.query).toHaveBeenCalledWith("BEGIN");
      expect(client.query).toHaveBeenCalledWith("COMMIT");
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment successful, room allocated",
      });
      expect(client.release).toHaveBeenCalled();
    });

    it("should rollback and return 500 when transaction fails", async () => {
      client.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 1, is_available: true }],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        })
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error("Insert failed")) // Insert fees
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      const req = {
        user: { id: 10 },
        body: { room_id: 1, months_paid: 3, amount: 15000 },
      };
      const res = mockRes();

      await payFees(req, res);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(client.release).toHaveBeenCalled();
    });
  });

  describe("getAllFees", () => {
    it("should return all fee records", async () => {
      const fees = [{ name: "John", amount: 15000 }];

      queryMock.mockResolvedValueOnce({ rows: fees });

      const req = {};
      const res = mockRes();

      await getAllFees(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fees,
      });
    });

    it("should return 500 when fetching fees fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getAllFees(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("allocateRoom", () => {
    it("should return 400 when room_id is missing", async () => {
      const req = {
        user: { id: 10 },
        body: {},
      };
      const res = mockRes();

      await allocateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 404 when student does not exist", async () => {
      client.query.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const req = {
        user: { id: 10 },
        body: { room_id: 1 },
      };
      const res = mockRes();

      await allocateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 404 when room does not exist", async () => {
      client.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 20 }],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        });

      const req = {
        user: { id: 10 },
        body: { room_id: 1 },
      };
      const res = mockRes();

      await allocateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 403 when no fee record exists", async () => {
      client.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 20 }],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 1, is_available: true }],
        })
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        });

      const req = {
        user: { id: 10 },
        body: { room_id: 1 },
      };
      const res = mockRes();

      await allocateRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(client.release).toHaveBeenCalled();
    });
  });
});
