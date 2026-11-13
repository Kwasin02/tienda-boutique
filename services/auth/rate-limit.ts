// Límite de intentos en memoria por clave (IP, IP+email…).
// shortcut: memoria de un solo proceso; con varias instancias del servidor, mover a la base de datos o Redis.

type Bucket = { count: number; resetAt: number };

export function createRateLimiter(max: number, windowMs: number) {
  const buckets = new Map<string, Bucket>(); // un contador independiente por limitador
  return {
    /** true si la clave ya superó el límite. */
    isBlocked(key: string, now = Date.now()) {
      const b = buckets.get(key);
      if (!b || b.resetAt <= now) return false;
      return b.count >= max;
    },
    hit(key: string, now = Date.now()) {
      const b = buckets.get(key);
      if (!b || b.resetAt <= now) buckets.set(key, { count: 1, resetAt: now + windowMs });
      else b.count++;
      if (buckets.size > 10_000) {
        for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      }
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
}
