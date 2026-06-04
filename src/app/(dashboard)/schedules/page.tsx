import { Header } from "@/components/layout/header";
import { ScheduleAdminConsole } from "@/components/schedules/schedule-admin-console";

export default function SchedulesPage() {
  return (
    <>
      <Header title="日程調整" />
      <main className="max-w-7xl p-6">
        <ScheduleAdminConsole />
      </main>
    </>
  );
}
