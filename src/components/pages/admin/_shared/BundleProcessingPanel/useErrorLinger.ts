import * as React from "react";

/**
 * How long a failed row stays on screen when the user does not touch it:
 * long enough to read the reason (and to hover the row and read it a moment
 * later), short enough that the panel does not keep every old failure
 * around.
 */
export const ERROR_LINGER_MS = 5000;

/**
 * How often the panel looks for rows whose time is up.
 */
export const ERROR_CHECK_MS = 250;

/**
 * Removes error rows that nobody is looking at.
 *
 * Every failed row (a failed upload, a failed extraction) gets
 * ERROR_LINGER_MS to live. Touching a row - the pointer on it, or its error
 * tooltip open - holds its countdown, so a row never disappears while the
 * reason is being read. Once the user is done with it, the row gets a fresh
 * window and then leaves on its own.
 *
 * `activeKeys` are the error rows currently on screen, `onExpire` is called
 * with the key of the row that timed out.
 */
export function useErrorLinger(
  activeKeys: string[],
  onExpire: (key: string) => void,
  enabled = true,
) {
  // Rows the user is engaged with (the pointer is on the row, or its error
  // tooltip is open): their countdown is on hold. A ref, not state: the
  // checker below reads it on every tick, and holding a row must not cost a
  // render.
  const heldRef = React.useRef<Set<string>>(new Set());
  // Hold reasons per row. The pointer and the tooltip can hold the same row
  // at the same time, so the reasons have to be balanced.
  const holdsRef = React.useRef<Map<string, number>>(new Map());
  // When each row may leave, in epoch ms.
  const deadlinesRef = React.useRef<Map<string, number>>(new Map());
  // Rows that already left on their own: they get no new deadline while
  // they are still on screen.
  const expiredRef = React.useRef<Set<string>>(new Set());
  const onExpireRef = React.useRef(onExpire);

  // The joined key identifies the set: `activeKeys` is rebuilt on every
  // render, but its contents only change when a row appears or leaves.
  const key = activeKeys.join("|");
  const hasErrors = key.length > 0;

  React.useEffect(() => {
    onExpireRef.current = onExpire;
  });

  React.useEffect(() => {
    const deadlines = deadlinesRef.current;
    const active = new Set(key ? key.split("|") : []);
    const now = Date.now();
    for (const k of [...deadlines.keys()]) {
      if (active.has(k)) continue;
      // The row is gone: forget everything about it, so a later row with the
      // same key starts from scratch.
      deadlines.delete(k);
      expiredRef.current.delete(k);
      heldRef.current.delete(k);
      holdsRef.current.delete(k);
    }
    for (const k of active) {
      if (expiredRef.current.has(k)) continue;
      if (!deadlines.has(k)) deadlines.set(k, now + ERROR_LINGER_MS);
    }
  }, [key]);

  React.useEffect(() => {
    if (!enabled || !hasErrors) return;
    // A ticker, not one timeout per row: a row that leaves does not have to
    // re-arm the timer for the other rows.
    const timer = window.setInterval(() => {
      const now = Date.now();
      for (const [k, deadline] of deadlinesRef.current) {
        if (heldRef.current.has(k) || deadline > now) continue;
        expiredRef.current.add(k);
        deadlinesRef.current.delete(k);
        onExpireRef.current(k);
      }
    }, ERROR_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, hasErrors]);

  function hold(k: string) {
    holdsRef.current.set(k, (holdsRef.current.get(k) ?? 0) + 1);
    heldRef.current.add(k);
  }

  function release(k: string) {
    const count = (holdsRef.current.get(k) ?? 0) - 1;
    if (count > 0) {
      holdsRef.current.set(k, count);
      return;
    }
    holdsRef.current.delete(k);
    heldRef.current.delete(k);
    // The user is done with it: a fresh window before it leaves.
    if (!expiredRef.current.has(k)) {
      deadlinesRef.current.set(k, Date.now() + ERROR_LINGER_MS);
    }
  }

  function touch(k: string) {
    if (expiredRef.current.has(k)) return;
    deadlinesRef.current.set(k, Date.now() + ERROR_LINGER_MS);
  }

  return { hold, release, touch };
}
