import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getSessionUser } from "../lib/session.js";
import { sendVerificationEmail } from "../lib/email.js";

const router: IRouter = Router();

function getBaseUrl(req: Request): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}`;
  return `${req.protocol}://${req.get("host")}`;
}

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      res.status(400).json({ error: "email, password, and displayName are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    if (displayName.length < 2 || displayName.length > 50) {
      res.status(400).json({ error: "Display name must be 2–50 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      verificationToken,
      verificationTokenExpiresAt: expiresAt,
    }).returning();

    req.session.userId = user.id;

    await sendVerificationEmail(email.toLowerCase(), verificationToken, getBaseUrl(req));

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        isMod: user.isMod,
        createdAt: user.createdAt,
      },
      message: "Account created! Please check your email to verify your address.",
    });
  } catch (err) {
    console.error("signup error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        isMod: user.isMod,
        createdAt: user.createdAt,
      },
      message: "Logged in successfully",
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", async (req: Request, res: Response) => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isMod: user.isMod,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("me error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.verificationToken, token)).limit(1);
    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification token" });
      return;
    }

    if (user.emailVerified) {
      res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          isMod: user.isMod,
          createdAt: user.createdAt,
        },
        message: "Email already verified",
      });
      return;
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      res.status(400).json({ error: "Verification token has expired. Please request a new one." });
      return;
    }

    const [updated] = await db.update(usersTable)
      .set({ emailVerified: true, verificationToken: null, verificationTokenExpiresAt: null })
      .where(eq(usersTable.id, user.id))
      .returning();

    req.session.userId = updated.id;

    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        emailVerified: updated.emailVerified,
        isMod: updated.isMod,
        createdAt: updated.createdAt,
      },
      message: "Email verified successfully! You can now post reviews.",
    });
  } catch (err) {
    console.error("verify-email error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-verification", async (req: Request, res: Response) => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(400).json({ error: "Not logged in" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.update(usersTable)
      .set({ verificationToken, verificationTokenExpiresAt: expiresAt })
      .where(eq(usersTable.id, userId));

    const baseUrl = process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : `${req.protocol}://${req.get("host")}`;

    await sendVerificationEmail(user.email, verificationToken, baseUrl);

    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("resend-verification error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
