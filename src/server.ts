import express, { Request, Response, NextFunction } from "express";
import { TokenBucketRateLimiter } from "./limiter.js";

export const app = express();
app.use(express.json());

// 5 requests burst capacity, refills 1 request per second
const limiter = new TokenBucketRateLimiter({
    capacity: 5,
    refillRate: 1,
});

// Middleware enforcing per-client rate limit via header or IP
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const clientId = (req.headers["x-client-id"] as string) || req.ip || "unknown-client";
    const result = limiter.allowRequest(clientId);

    res.setHeader("X-RateLimit-Remaining", result.remaining.toString());

    if (!result.allowed) {
        res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded. Try again in a few seconds.",
        });
        return;
    }

    next();
};

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/resource", rateLimitMiddleware, (req: Request, res: Response) => {
    res.json({
        data: "Protected resource retrieved successfully",
        accessedBy: req.headers["x-client-id"] || req.ip,
    });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}