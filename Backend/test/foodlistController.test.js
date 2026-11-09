
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../config/db.js";
import fs from "fs";

import {
  uploadDishPhoto,
  createFood,
  getDishesByMenu,
  deleteDish,
  selectDish,
  showfood,
  getDishSelectionStats,
} from "../controllers/foodlistController.js";

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

describe("Food List Controller", () => {

  // Upload dish photo
  describe("uploadDishPhoto", () => {
    it("should return 400 when no file is uploaded", async () => {
      const req = {};
      const res = mockRes();

      await uploadDishPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No file uploaded",
      });
    });

    it("should return uploaded photo URL", async () => {
      const req = {
        file: { filename: "dish123.jpg" },
      };
      const res = mockRes();

      await uploadDishPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      // Match the URL generated using the current BASE_URL.
      expect(res.json).toHaveBeenCalledWith({
        url: `${process.env.BASE_URL || "http://localhost:3000"}/uploads/dishes/dish123.jpg`,
      });
    });
  });

  // Create food
  describe("createFood", () => {
    it("should return 400 when required fields are missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await createFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when no active meal exists", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = {
        body: {
          dish: "Rice",
          nonveg: false,
          meal: "Lunch",
        },
      };
      const res = mockRes();

      await createFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should create a dish successfully", async () => {
      const dish = {
        id: 1,
        dish_name: "Rice",
        is_nonveg: false,
      };

      queryMock
        .mockResolvedValueOnce({
          rows: [{ id: 5 }],
        })
        .mockResolvedValueOnce({
          rows: [dish],
        });

      const req = {
        body: {
          dish: "Rice",
          nonveg: false,
          meal: "Lunch",
        },
      };
      const res = mockRes();

      await createFood(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(dish);
    });

    it("should return 500 when database query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        body: {
          dish: "Rice",
          nonveg: false,
          meal: "Lunch",
        },
      };
      const res = mockRes();

      await createFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Get dishes by menu
  describe("getDishesByMenu", () => {
    it("should return dishes for a menu", async () => {
      const dishes = [{ id: 1, dish_name: "Rice" }];

      queryMock.mockResolvedValueOnce({ rows: dishes });

      const req = { params: { menuId: "5" } };
      const res = mockRes();

      await getDishesByMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ dishes });
    });

    it("should return 500 when fetching dishes fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = { params: { menuId: "5" } };
      const res = mockRes();

      await getDishesByMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Delete dish
  describe("deleteDish", () => {
    it("should return 404 when dish does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = { params: { id: "1" } };
      const res = mockRes();

      await deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete a dish successfully", async () => {
      const dish = {
        id: 1,
        dish_name: "Rice",
        photo_url: null,
      };

      queryMock.mockResolvedValueOnce({ rows: [dish] });

      const req = { params: { id: "1" } };
      const res = mockRes();

      await deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Dish removed successfully",
        data: dish,
      });
    });

    it("should return 500 when delete query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = { params: { id: "1" } };
      const res = mockRes();

      await deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Select dish
  describe("selectDish", () => {
    it("should return 401 when user is not authenticated", async () => {
      const req = {
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should return 400 when meal_id or dish_id is missing", async () => {
      const req = {
        user: { id: 10 },
        body: { meal_id: 1 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when student does not exist", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = {
        user: { id: 10 },
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 404 when meal is not active", async () => {
      queryMock
        .mockResolvedValueOnce({ rows: [{ id: 20 }] })
        .mockResolvedValueOnce({ rows: [] });

      const req = {
        user: { id: 10 },
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 404 when dish does not belong to meal", async () => {
      queryMock
        .mockResolvedValueOnce({ rows: [{ id: 20 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      const req = {
        user: { id: 10 },
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 409 when food is already selected", async () => {
      queryMock
        .mockResolvedValueOnce({ rows: [{ id: 20 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 3 }] });

      const req = {
        user: { id: 10 },
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should select food successfully", async () => {
      const selection = {
        id: 1,
        student_id: 20,
        menu_id: 1,
        dish_id: 2,
      };

      queryMock
        .mockResolvedValueOnce({ rows: [{ id: 20 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [selection] });

      const req = {
        user: { id: 10 },
        body: { meal_id: 1, dish_id: 2 },
      };
      const res = mockRes();

      await selectDish(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Food selected successfully",
        data: selection,
      });
    });
  });

  // Show available food
  describe("showfood", () => {
    it("should return 404 when no food items are available", async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const req = {};
      const res = mockRes();

      await showfood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return available food items", async () => {
      const dishes = [{ dish_name: "Rice" }];

      queryMock.mockResolvedValueOnce({ rows: dishes });

      const req = {};
      const res = mockRes();

      await showfood(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: dishes,
      });
    });

    it("should return 500 when query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await showfood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Dish selection statistics
  describe("getDishSelectionStats", () => {
    it("should return dish selection statistics", async () => {
      const stats = [
        {
          meal: "Lunch",
          dish_name: "Rice",
          selected_count: "10",
        },
      ];

      queryMock.mockResolvedValueOnce({ rows: stats });

      const req = {};
      const res = mockRes();

      await getDishSelectionStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: stats,
      });
    });

    it("should return 500 when statistics query fails", async () => {
      queryMock.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = mockRes();

      await getDishSelectionStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
