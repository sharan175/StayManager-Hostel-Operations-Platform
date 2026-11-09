
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: {
    connect: vi.fn(),
  },
}));

import pool from "../config/db.js";
import { checkFees } from "../middleware/checkFees.js";

const connectMock = pool.connect;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

let client;

beforeEach(() => {
  connectMock.mockReset();

  client = {
    query: vi.fn(),
    release: vi.fn(),
  };

  connectMock.mockResolvedValue(client);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Check Fees Middleware", () => {
  it("should return 404 when student does not exist", async () => {
    client.query.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  it("should return 403 when fees are not paid", async () => {
    client.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ fees_paid: false }],
    });

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  it("should return 403 when no fee record exists", async () => {
    client.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ fees_paid: true }],
      })
      .mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  it("should call next when fees have not expired", async () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    client.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ fees_paid: true }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ expire_at: futureDate }],
      });

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  it("should block access during the three-day grace period", async () => {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    client.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ fees_paid: true }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ expire_at: expiredDate }],
      });

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fees expired, please renew",
    });
    expect(next).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  it("should release room after the grace period", async () => {
    const expiredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    client.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ fees_paid: true }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ expire_at: expiredDate }],
      })
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ room_id: 5 }],
      })
      .mockResolvedValueOnce({ rows: [] }) // Deactivate allocation
      .mockResolvedValueOnce({ rows: [] }) // Decrease occupied count
      .mockResolvedValueOnce({ rows: [] }) // Update fees_paid
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fees expired, room released. Please pay again",
    });
    expect(client.release).toHaveBeenCalled();
  });

  it("should return 500 when a database operation fails", async () => {
    client.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ fees_paid: true }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ expire_at: new Date(Date.now() - 5 * 86400000) }],
      })
      .mockRejectedValueOnce(new Error("Database error")) // BEGIN
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const req = { user: { id: 10 } };
    const res = mockRes();
    const next = vi.fn();

    await checkFees(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(client.release).toHaveBeenCalled();
  });
});
