"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithRole } from "@/lib/rbac-client";

type StudentRow = {
  id: string;
  name: string;
  school: string;
  department: string;
  status: string;
  score: number;
  source?: string;
  lineUserId?: string;
  interviewAt?: string;
};

type ScheduleEvent = {
  id: string;
  title: string;
  slots: {
    id: string;
    startsAt: string;
    endsAt: string;
    bookings: {
      id: string;
      applicantId?: string;
      lineUserId?: string;
      applicantName?: string;
      status: string;
      note?: string;
    }[];
  }[];
};

type InterviewReservation = {
  startsAt: string;
  endsAt: string;
  eventTitle: string;
  status: string;
  note?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeName(value?: string) {
  return (value ?? "").replace(/\s/g, "").trim();
}

function findReservation(student: StudentRow, events: ScheduleEvent[]): InterviewReservation | undefined {
  const normalizedStudentName = normalizeName(student.name);
  const reservations = events.flatMap((event) =>
    event.slots.flatMap((slot) =>
      slot.bookings
        .filter((booking) => booking.status === "booked")
        .filter((booking) =>
          Boolean(booking.applicantId && booking.applicantId === student.id) ||
          Boolean(booking.lineUserId && student.lineUserId && booking.lineUserId === student.lineUserId) ||
          Boolean(normalizedStudentName && normalizeName(booking.applicantName) === normalizedStudentName)
        )
        .map((booking) => ({
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          eventTitle: event.title,
          status: booking.status,
          note: booking.note,
        }))
    )
  );

  return reservations.sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
}

export default function StudentsPage() {
  const [lineStudents, setLineStudents] = useState<StudentRow[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    Promise.all([
      fetchWithRole("/api/line/applicants", { cache: "no-store" })
        .then(async (response) => response.ok ? response.json() : { students: [] })
        .catch(() => ({ students: [] })),
      fetchWithRole("/api/schedules/events", { cache: "no-store" })
        .then(async (response) => response.ok ? response.json() : { events: [] })
        .catch(() => ({ events: [] })),
    ]).then(([applicantsJson, schedulesJson]) => {
      setLineStudents(applicantsJson.students ?? []);
      setScheduleEvents(schedulesJson.events ?? []);
    });
  }, []);

  const students = useMemo(
    () => lineStudents.map((student) => ({ ...student, reservation: findReservation(student, scheduleEvents) })),
    [lineStudents, scheduleEvents]
  );

  return (
    <>
      <Header title="候補者管理" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">候補者一覧</h2>
            <p className="text-sm text-gray-500">LINE応募・学校情報・選考状況・面接予約を一覧で確認できます。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>CSV取込</Button>
            <Button disabled>候補者を追加</Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-gray-500 font-medium">氏名</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">流入</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">学校</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">学科</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">選考状況</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">面接日時</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">AIマッチ度</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    候補者データはまだありません。ダミーデータは表示していません。
                  </td>
                </tr>
              ) : students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      {student.source ?? "LINE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.school}</td>
                  <td className="px-6 py-4 text-gray-600">{student.department}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{student.status}</span></td>
                  <td className="px-6 py-4 text-gray-700">
                    {student.reservation ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-indigo-700">{formatDateTime(student.reservation.startsAt)}</div>
                        <div className="text-xs text-gray-500">{student.reservation.eventTitle} / 予約済み</div>
                      </div>
                    ) : student.interviewAt ? (
                      <div className="font-semibold text-indigo-700">{formatDateTime(student.interviewAt)}</div>
                    ) : (
                      <span className="text-gray-400">未予約</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">{student.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
