import type { Request, Response, NextFunction } from "express";
import { listService } from "../services/listService.js";
import { emitToBoard } from "../services/socketService.js";

export const listController = {
  /** POST /api/boards/:boardId/lists */
  async createList(req: Request, res: Response, next: NextFunction) {
    try {
      const boardId = req.params.boardId as string;
      const list = await listService.createList(boardId, req.userId!, req.body);

      emitToBoard(boardId, "list:created", { boardId, list });

      res.status(201).json({
        success: true,
        data: list,
        message: "List created successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** PUT /api/boards/:boardId/lists/:listId */
  async updateList(req: Request, res: Response, next: NextFunction) {
    try {
      const listId = req.params.listId as string;
      const list = await listService.updateList(listId, req.userId!, req.body);
      const boardId = req.params.boardId as string;

      emitToBoard(boardId, "list:updated", { boardId, list });

      res.json({
        success: true,
        data: list,
        message: "List updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/boards/:boardId/lists/:listId */
  async deleteList(req: Request, res: Response, next: NextFunction) {
    try {
      const listId = req.params.listId as string;
      const boardId = req.params.boardId as string;
      await listService.deleteList(listId, req.userId!);

      emitToBoard(boardId, "list:deleted", { boardId, listId });

      res.json({
        success: true,
        message: "List deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
