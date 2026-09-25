import "server-only";
import { prisma } from "@/lib/prisma";
import type { Region } from "@prisma/client";
import type { AnalyticsEventName } from "./events";

/**
 * Best-effort server-side event recording. Never throws into the caller;
 * analytics failures must not affect user-facing requests.
 */
export async function recordEvent(
  name: AnalyticsEventName,
  properties?: Record<string, unknown> | null,
  region?: Region | null,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name,
        properties: properties ? (properties as object) : undefined,
        region: region ?? undefined,
      },
    });
  } catch {
    /* swallow */
  }
}
