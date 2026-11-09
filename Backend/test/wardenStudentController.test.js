
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import { getstudent } from "../controllers/wardenStudentController.js";

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

describe("Warden Student Controller", () => {
  it("should return 404 when warden has no assigned floor", async () => {
    queryMock.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });

    const req = { user: { id: 10 } };
    const res = mockRes();

    await getstudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "floor not assigned",
    });
  });

  it("should return message when no students are found", async () => {
    queryMock
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ floor_id: 5 }],
      })
      .mockResolvedValueOnce({
        rows: [],
      });

    const req = { user: { id: 10 } };
    const res = mockRes();

    await getstudent(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "No details found",
    });
  });

  it("should return students assigned to the warden's floor", async () => {
    const students = [
      {
        name: "Alex",
        phone: "9876543210",
        room_number: 101,
        paid: true,
      },
      {
        name: "Sam",
        phone: "9876543211",
        room_number: 102,
        paid: false,
      },
    ];

    queryMock
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ floor_id: 5 }],
      })
      .mockResolvedValueOnce({
        rows: students,
      });

    const req = { user: { id: 10 } };
    const res = mockRes();

    await getstudent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "success",
      user: students,
    });
  });

  it("should return 500 when database query fails", async () => {
    queryMock.mockRejectedValueOnce(new Error("Database error"));

    const req = { user: { id: 10 } };
    const res = mockRes();

    await getstudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
