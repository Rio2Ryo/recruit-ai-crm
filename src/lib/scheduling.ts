import "server-only";
import { randomUUID } from "node:crypto";

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
};

function now() {
  return new Date().toISOString();
}

function inDays(days: number, hour: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  value.setUTCHours(hour, 0, 0, 0);
  return value.toISOString();
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

function refreshSlot(slot: ScheduleSlot) {
  const bookedCount = slot.bookings.filter((booking) => booking.status === "booked").length;
  const status = slot.status === "cancelled"
    ? slot.status
    : bookedCount >= slot.capacity
      ? "full"
      : "open";
  return { ...slot, bookedCount, status };
}

export function listScheduleEvents() {
  return store().map((event) => ({
    ...event,
    slots: event.slots.map(refreshSlot).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  }));
}

export function createScheduleEvent(input: {
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

export function createScheduleSlot(input: {
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

export function createScheduleBooking(input: {
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
  if (refreshed.status === "full" || refreshed.status === "cancelled") {
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
