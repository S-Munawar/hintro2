import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { logger } from "../utils/logger.js";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing access token",
        },
      });
      return;
    }

    // Verify token with Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      });
      return;
    }

    // Ensure profile exists in our database
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      // Auto-create profile from Supabase user data
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email || "",
          first_name: user.user_metadata?.first_name || user.email?.split("@")[0] || "User",
          last_name: user.user_metadata?.last_name || "",
        },
      });
    }

    req.userId = user.id;
    req.userEmail = user.email;

    next();
  } catch (error) {
    logger.error("Auth middleware error", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Authentication failed",
      },
    });
  }
}
