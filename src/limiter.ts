export interface RateLimiterOptions {
    capacity: number;      // Maximum number of tokens bucket can hold
    refillRate: number;    // Tokens added per second
}

interface BucketState {
    tokens: number;
    lastRefillTimestamp: number;
}

export class TokenBucketRateLimiter {
    private buckets = new Map<string, BucketState>();
    private capacity: number;
    private refillRate: number;

    constructor(options: RateLimiterOptions) {
        if (options.capacity <= 0 || options.refillRate <= 0) {
            throw new Error("Capacity and refill rate must be positive values.");
        }
        this.capacity = options.capacity;
        this.refillRate = options.refillRate;
    }

    public allowRequest(key: string, cost: number = 1): { allowed: boolean; remaining: number } {
        const now = Date.now();
        let state = this.buckets.get(key);

        if (!state) {
            state = {
                tokens: this.capacity,
                lastRefillTimestamp: now,
            };
            this.buckets.set(key, state);
        } else {
            // Calculate token refill based on elapsed time
            const elapsedSeconds = (now - state.lastRefillTimestamp) / 1000;
            const refilledTokens = elapsedSeconds * this.refillRate;
            state.tokens = Math.min(this.capacity, state.tokens + refilledTokens);
            state.lastRefillTimestamp = now;
        }

        if (state.tokens >= cost) {
            state.tokens -= cost;
            return { allowed: true, remaining: Math.floor(state.tokens) };
        }

        return { allowed: false, remaining: Math.floor(state.tokens) };
    }

    public reset(key?: string): void {
        if (key) {
            this.buckets.delete(key);
        } else {
            this.buckets.clear();
        }
    }
}// updated rate limiter logic
// update
