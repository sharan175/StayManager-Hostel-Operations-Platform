
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

import pool from "../config/db.js";
import {
  createMenu,
  getActiveMenu,
  endMenuEarly,
} from "../controllers/foodmenuController.js";

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

describe("Food Menu Controller", () => {

  describe("createMenu", () => {
    it("should return 400 when meal is missing", async () => {
      const req = {
        body: { duration: 30, unit: "minutes" },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(client.release).toHaveBeenCalled();
    });

    it("should return 400 when duration is invalid", async () => {
      const req = {
        body: {
          meal: "Lunch",
          duration: -5,
          unit: "minutes",
        },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when unit is invalid", async () => {
      const req = {
        body: {
          meal: "Lunch",
          duration: 30,
          unit: "days",
        },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when duration exceeds 24 hours", async () => {
      const req = {
        body: {
          meal: "Lunch",
          duration: 1441,
          unit: "minutes",
        },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should create a menu successfully", async () => {
      const menu = {
        id: 1,
        meal: "Lunch",
      };

      client.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [menu] }) // INSERT
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const req = {
        body: {
          meal: " Lunch ",
          duration: 30,
          unit: "minutes",
        },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(client.query).toHaveBeenCalledWith("BEGIN");
      expect(client.query).toHaveBeenCalledWith("COMMIT");

      expect(client.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO food_menu"),
        ["Lunch", "30 minutes"]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu created successfully",
        data: menu,
      });

      expect(client.release).toHaveBeenCalled();
    });

    it("should rollback and return 500 when menu creation fails", async () => {
      client.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error("Insert failed")) // INSERT
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      const req = {
        body: {
          meal: "Lunch",
          duration: 30,
          unit: "minutes",
        },
      };
      const res = mockRes();

      await createMenu(req, res);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(client.release).toHaveBeenCalled();
    });
  });

  describe("getActiveMenu", () => {
    it("should return null when no active menu exists", async () => {
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      const req = {};
      const res = mockRes();

      await getActiveMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        menu: null,
      });
    });

    it("should return the active menu", async () => {
      const menu = {
        id: 1,
        meal: "Lunch",
      };

      queryMock.mockResolvedValueOnce({
        rows: [menu],
      });

      const req = {};
      const res = mockRes();

      await getActiveMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        menu,
      });
    });

    it("should return 500 when fetching menu fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getActiveMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("endMenuEarly", () => {
    it("should return 404 when menu does not exist", async () => {
      queryMock.mockResolvedValueOnce({
        rows: [],
      });

      const req = {
        params: { id: "1" },
      };
      const res = mockRes();

      await endMenuEarly(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should end a menu successfully", async () => {
      const menu = {
        id: 1,
        meal: "Lunch",
      };

      queryMock.mockResolvedValueOnce({
        rows: [menu],
      });

      const req = {
        params: { id: "1" },
      };
      const res = mockRes();

      await endMenuEarly(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu ended",
        data: menu,
      });
    });

    it("should return 500 when update query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        params: { id: "1" },
      };
      const res = mockRes();

      await endMenuEarly(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
