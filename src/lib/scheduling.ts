import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type ScheduleEventType = "interview" | "briefing" | "other";
export type ScheduleSlotStatus = "open" | "closed" | "full" | "cancelled";
export type ScheduleBookingStatus = "booked" | "cancelled" | "attended" | "no_show";

export type ScheduleBooking = {
  id: string;
  slotId: string;
  applicantId?: string;
  lineUserId?: string;
  applicantName?: string;
  status: ScheduleBookingStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleSlot = {
  id: string;
  eventId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  status: ScheduleSlotStatus;
  createdAt: string;
  updatedAt: string;
  bookings: ScheduleBooking[];
};

export type ScheduleEvent = {
  id: string;
  type: ScheduleEventType;
  title: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  ownerName?: string;
  isPublic: boolean;
  deadlineAt?: string;
  createdAt: string;
  updatedAt: string;
  slots: ScheduleSlot[];
};

const globalForScheduling = globalThis as unknown as {
  scheduleEvents?: ScheduleEvent[];
  scheduleDbUnavailable?: boolean;
};

function hasDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  return Boolean(value && value !== '""' && value !== "''");
}

function now() {
  return new Date().toISOString();
}

function inDays(days: number, hour: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  value.setUTCHours(hour, 0, 0, 0);
  return value.toISOString();
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toScheduleBooking(record: {
  id: string;
  slotId: string;
  applicantId: string | null;
  lineUserId: string | null;
  applicantName: string | null;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ScheduleBooking {
  return {
    id: record.id,
    slotId: record.slotId,
    applicantId: record.applicantId ?? undefined,
    lineUserId: record.lineUserId ?? undefined,
    applicantName: record.applicantName ?? undefined,
    status: record.status as ScheduleBookingStatus,
    note: record.note ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function refreshSlot(slot: ScheduleSlot) {
  const bookedCount = slot.bookings.filter((booking) => booking.status === "booked").length;
  const status: ScheduleSlotStatus = slot.status === "cancelled" || slot.status === "closed"
    ? slot.status
    : bookedCount >= slot.capacity
      ? "full"
      : "open";
  return { ...slot, bookedCount, status };
}

function toScheduleSlot(record: {
  id: string;
  eventId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  bookedCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Array<Parameters<typeof toScheduleBooking>[0]>;
}): ScheduleSlot {
  return refreshSlot({
    id: record.id,
    eventId: record.eventId,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    capacity: record.capacity,
    bookedCount: record.bookedCount,
    status: record.status as ScheduleSlotStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    bookings: (record.bookings ?? []).map(toScheduleBooking),
  });
}

function toScheduleEvent(record: {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  onlineUrl: string | null;
  ownerName: string | null;
  isPublic: boolean;
  deadlineAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  slots?: Array<Parameters<typeof toScheduleSlot>[0]>;
}): ScheduleEvent {
  return {
    id: record.id,
    type: record.type as ScheduleEventType,
    title: record.title,
    description: record.description ?? undefined,
    location: record.location ?? undefined,
    onlineUrl: record.onlineUrl ?? undefined,
    ownerName: record.ownerName ?? undefined,
    isPublic: record.isPublic,
    deadlineAt: toIso(record.deadlineAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    slots: (record.slots ?? []).map(toScheduleSlot).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}

function shouldFallback(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  return code === "P2021" || code === "P2022" || code === "42P01";
}

function markDbUnavailable(error: unknown) {
  if (shouldFallback(error)) {
    globalForScheduling.scheduleDbUnavailable = true;
    console.warn("Schedule DB tables unavailable; using memory fallback", error);
    return true;
  }
  return false;
}

function seedEvents(): ScheduleEvent[] {
  const createdAt = now();
  const eventId = "schedule-event-demo-interview";
  const slotId = "schedule-slot-demo-interview-1";
  return [
    {
      id: eventId,
      type: "interview",
      title: "一次面接",
      description: "LINE応募者向けの一次面接枠です。",
      location: "オンライン",
      onlineUrl: "https://meet.example.com/recruit",
      ownerName: "採用担当",
      isPublic: false,
      deadlineAt: inDays(6, 14),
      createdAt,
      updatedAt: createdAt,
      slots: [
        {
          id: slotId,
          eventId,
          startsAt: inDays(7, 10),
          endsAt: inDays(7, 11),
          capacity: 3,
          bookedCount: 0,
          status: "open",
          createdAt,
          updatedAt: createdAt,
          bookings: [],
        },
      ],
    },
  ];
}

function store() {
  if (!globalForScheduling.scheduleEvents) {
    globalForScheduling.scheduleEvents = seedEvents();
  }
  return globalForScheduling.scheduleEvents;
}

function shouldUseMemoryFallback() {
  return !hasDatabaseUrl() || globalForScheduling.scheduleDbUnavailable;
}

function listScheduleEventsFromMemory() {
  return store().map((event) => ({
    ...event,
    slots: event.slots.map(refreshSlot).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  }));
}

export async function listScheduleEvents() {
  if (shouldUseMemoryFallback()) return listScheduleEventsFromMemory();

  try {
    const records = await prisma.scheduleEventRecord.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        slots: {
          orderBy: [{ startsAt: "asc" }],
          include: { bookings: { orderBy: [{ createdAt: "desc" }] } },
        },
      },
    });
    return records.map(toScheduleEvent);
  } catch (error) {
    if (markDbUnavailable(error)) return listScheduleEventsFromMemory();
    throw error;
  }
}

export async function createScheduleEvent(input: {
  type?: ScheduleEventType;
  title?: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  ownerName?: string;
  isPublic?: boolean;
  deadlineAt?: string;
}) {
  if (shouldUseMemoryFallback()) return createScheduleEventInMemory(input);

  try {
    const record = await prisma.scheduleEventRecord.create({
      data: {
        type: input.type ?? "interview",
        title: input.title?.trim() || "新しい日程イベント",
        description: input.description?.trim() || null,
        location: input.location?.trim() || null,
        onlineUrl: input.onlineUrl?.trim() || null,
        ownerName: input.ownerName?.trim() || null,
        isPublic: Boolean(input.isPublic),
        deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : null,
      },
      include: { slots: { include: { bookings: true } } },
    });
    return toScheduleEvent(record);
  } catch (error) {
    if (markDbUnavailable(error)) return createScheduleEventInMemory(input);
    throw error;
  }
}

function createScheduleEventInMemory(input: {
  type?: ScheduleEventType;
  title?: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  ownerName?: string;
  isPublic?: boolean;
  deadlineAt?: string;
}) {
  const createdAt = now();
  const event: ScheduleEvent = {
    id: randomUUID(),
    type: input.type ?? "interview",
    title: input.title?.trim() || "新しい日程イベント",
    description: input.description?.trim() || undefined,
    location: input.location?.trim() || undefined,
    onlineUrl: input.onlineUrl?.trim() || undefined,
    ownerName: input.ownerName?.trim() || undefined,
    isPublic: Boolean(input.isPublic),
    deadlineAt: input.deadlineAt || undefined,
    createdAt,
    updatedAt: createdAt,
    slots: [],
  };
  store().unshift(event);
  return event;
}

export async function deleteScheduleEvent(eventId?: string) {
  if (!eventId) return false;
  if (shouldUseMemoryFallback()) {
    const items = store();
    const index = items.findIndex((event) => event.id === eventId);
    if (index === -1) return false;
    items.splice(index, 1);
    return true;
  }

  try {
    await prisma.scheduleEventRecord.delete({ where: { id: eventId } });
    return true;
  } catch (error) {
    if (markDbUnavailable(error)) return deleteScheduleEvent(eventId);
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P2025") return false;
    throw error;
  }
}

export async function createScheduleSlot(input: {
  eventId?: string;
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
  status?: ScheduleSlotStatus;
}) {
  if (shouldUseMemoryFallback()) return createScheduleSlotInMemory(input);

  try {
    const event = await prisma.scheduleEventRecord.findUnique({ where: { id: input.eventId } });
    if (!event) return null;

    const startsAt = input.startsAt ? new Date(input.startsAt) : new Date();
    const endsAt = input.endsAt ? new Date(input.endsAt) : startsAt;
    const record = await prisma.scheduleSlotRecord.create({
      data: {
        eventId: event.id,
        startsAt,
        endsAt,
        capacity: Math.max(1, Number(input.capacity) || 1),
        status: input.status ?? "open",
      },
      include: { bookings: true },
    });
    return toScheduleSlot(record);
  } catch (error) {
    if (markDbUnavailable(error)) return createScheduleSlotInMemory(input);
    throw error;
  }
}

function createScheduleSlotInMemory(input: {
  eventId?: string;
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
  status?: ScheduleSlotStatus;
}) {
  const event = store().find((item) => item.id === input.eventId);
  if (!event) return null;
  const createdAt = now();
  const slot: ScheduleSlot = {
    id: randomUUID(),
    eventId: event.id,
    startsAt: input.startsAt || createdAt,
    endsAt: input.endsAt || input.startsAt || createdAt,
    capacity: Math.max(1, Number(input.capacity) || 1),
    bookedCount: 0,
    status: input.status ?? "open",
    createdAt,
    updatedAt: createdAt,
    bookings: [],
  };
  event.slots.push(slot);
  event.updatedAt = createdAt;
  return slot;
}

export async function updateScheduleSlotStatus(input: { slotId?: string; status?: ScheduleSlotStatus }) {
  if (!input.slotId || !input.status) return null;
  if (shouldUseMemoryFallback()) {
    const slot = store().flatMap((event) => event.slots).find((item) => item.id === input.slotId);
    if (!slot) return null;
    slot.status = input.status;
    slot.updatedAt = now();
    return refreshSlot(slot);
  }

  try {
    const record = await prisma.scheduleSlotRecord.update({
      where: { id: input.slotId },
      data: { status: input.status },
      include: { bookings: true },
    });
    return toScheduleSlot(record);
  } catch (error) {
    if (markDbUnavailable(error)) return updateScheduleSlotStatus(input);
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P2025") return null;
    throw error;
  }
}

export async function createScheduleBooking(input: {
  slotId?: string;
  applicantId?: string;
  lineUserId?: string;
  applicantName?: string;
  status?: ScheduleBookingStatus;
  note?: string;
}) {
  if (shouldUseMemoryFallback()) return createScheduleBookingInMemory(input);

  try {
    const slot = await prisma.scheduleSlotRecord.findUnique({
      where: { id: input.slotId },
      include: { bookings: true },
    });
    if (!slot) return null;

    const refreshed = toScheduleSlot(slot);
    if (refreshed.status === "full" || refreshed.status === "cancelled" || refreshed.status === "closed") {
      return { error: "slot is not bookable" as const };
    }

    const booking = await prisma.scheduleBookingRecord.create({
      data: {
        slotId: slot.id,
        applicantId: input.applicantId?.trim() || null,
        lineUserId: input.lineUserId?.trim() || null,
        applicantName: input.applicantName?.trim() || null,
        status: input.status ?? "booked",
        note: input.note?.trim() || null,
      },
    });

    const bookedCount = await prisma.scheduleBookingRecord.count({
      where: { slotId: slot.id, status: "booked" },
    });
    await prisma.scheduleSlotRecord.update({
      where: { id: slot.id },
      data: {
        bookedCount,
        status: bookedCount >= slot.capacity ? "full" : slot.status === "full" ? "open" : slot.status,
      },
    });

    return toScheduleBooking(booking);
  } catch (error) {
    if (markDbUnavailable(error)) return createScheduleBookingInMemory(input);
    throw error;
  }
}

export async function updateScheduleBookingStatus(input: { bookingId?: string; status?: ScheduleBookingStatus }) {
  if (!input.bookingId || !input.status) return null;
  if (shouldUseMemoryFallback()) {
    for (const event of store()) {
      for (const slot of event.slots) {
        const booking = slot.bookings.find((item) => item.id === input.bookingId);
        if (!booking) continue;
        booking.status = input.status;
        booking.updatedAt = now();
        const updatedSlot = refreshSlot(slot);
        Object.assign(slot, updatedSlot);
        return booking;
      }
    }
    return null;
  }

  try {
    const booking = await prisma.scheduleBookingRecord.update({
      where: { id: input.bookingId },
      data: { status: input.status },
    });
    const slot = await prisma.scheduleSlotRecord.findUnique({ where: { id: booking.slotId } });
    if (slot) {
      const bookedCount = await prisma.scheduleBookingRecord.count({
        where: { slotId: slot.id, status: "booked" },
      });
      await prisma.scheduleSlotRecord.update({
        where: { id: slot.id },
        data: {
          bookedCount,
          status: slot.status === "full" && bookedCount < slot.capacity ? "open" : slot.status,
        },
      });
    }
    return toScheduleBooking(booking);
  } catch (error) {
    if (markDbUnavailable(error)) return updateScheduleBookingStatus(input);
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P2025") return null;
    throw error;
  }
}

function createScheduleBookingInMemory(input: {
  slotId?: string;
  applicantId?: string;
  lineUserId?: string;
  applicantName?: string;
  status?: ScheduleBookingStatus;
  note?: string;
}) {
  const event = store().find((item) => item.slots.some((slot) => slot.id === input.slotId));
  const slot = event?.slots.find((item) => item.id === input.slotId);
  if (!event || !slot) return null;

  const refreshed = refreshSlot(slot);
  if (refreshed.status === "full" || refreshed.status === "cancelled" || refreshed.status === "closed") {
    return { error: "slot is not bookable" as const };
  }

  const createdAt = now();
  const booking: ScheduleBooking = {
    id: randomUUID(),
    slotId: slot.id,
    applicantId: input.applicantId?.trim() || undefined,
    lineUserId: input.lineUserId?.trim() || undefined,
    applicantName: input.applicantName?.trim() || undefined,
    status: input.status ?? "booked",
    note: input.note?.trim() || undefined,
    createdAt,
    updatedAt: createdAt,
  };
  slot.bookings.unshift(booking);
  const updatedSlot = refreshSlot({ ...slot, updatedAt: createdAt });
  Object.assign(slot, updatedSlot);
  event.updatedAt = createdAt;
  return booking;
}
