import type { Request, Response, NextFunction } from "express";
import { taskService } from "../services/taskService.js";
import { emitToBoard } from "../services/socketService.js";

export const taskController = {
  /** GET /api/boards/:boardId/tasks */
  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const boardId = req.params.boardId as string;
      const query = req.validatedQuery || req.query;
      const result = await taskService.getTasksByBoardId(boardId, {
        list_id: query.list_id as string | undefined,
        priority: query.priority as string | undefined,
        assigned_to: query.assigned_to as string | undefined,
        search: query.search as string | undefined,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 50,
      });

      res.json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/boards/:boardId/tasks */
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.userId!, req.body);
      const boardId = req.params.boardId as string;

      emitToBoard(boardId, "task:created", { boardId, task });

      res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/boards/:boardId/tasks/:taskId */
  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const task = await taskService.getTaskById(taskId);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /** PUT /api/boards/:boardId/tasks/:taskId */
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const task = await taskService.updateTask(taskId, req.userId!, req.body);
      const boardId = req.params.boardId as string;

      emitToBoard(boardId, "task:updated", { boardId, task });

      res.json({
        success: true,
        data: task,
        message: "Task updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/boards/:boardId/tasks/:taskId */
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const boardId = req.params.boardId as string;
      await taskService.deleteTask(taskId, req.userId!);

      emitToBoard(boardId, "task:deleted", { boardId, taskId, listId: "" });

      res.json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** PUT /api/boards/:boardId/tasks/:taskId/move */
  async moveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const task = await taskService.moveTask(taskId, req.userId!, req.body);
      const boardId = req.params.boardId as string;

      emitToBoard(boardId, "task:moved", { boardId, task });

      res.json({
        success: true,
        data: task,
        message: "Task moved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/boards/:boardId/tasks/:taskId/assignees */
  async assignUser(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const assignment = await taskService.assignUser(
        taskId,
        req.userId!,
        req.body.user_id,
      );
      const boardId = req.params.boardId as string;

      // Re-fetch updated task to broadcast full state
      const updatedTask = await taskService.getTaskById(taskId);
      emitToBoard(boardId, "task:updated", { boardId, task: updatedTask });

      res.status(201).json({
        success: true,
        data: assignment,
        message: "User assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/boards/:boardId/tasks/:taskId/assignees/:userId */
  async unassignUser(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const targetUserId = req.params.userId as string;
      const boardId = req.params.boardId as string;
      await taskService.unassignUser(taskId, req.userId!, targetUserId);

      const updatedTask = await taskService.getTaskById(taskId);
      emitToBoard(boardId, "task:updated", { boardId, task: updatedTask });

      res.json({
        success: true,
        message: "User unassigned successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
