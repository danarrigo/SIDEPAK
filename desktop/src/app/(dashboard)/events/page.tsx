import { getCurrentMember } from "@/actions/members";
import { getEventsByCooperative, getMemberEventParticipations } from "@/actions/events";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema/activities";
import { eq } from "drizzle-orm";
import EventCard from "@/components/EventCard";

export default async function EventsPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  if (!currentMember.cooperativeId) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-background p-8">
        <h1 className="text-2xl text-on-surface">Anda belum bergabung dengan Koperasi manapun.</h1>
      </main>
    );
  }

  // Seed events if there are none for this cooperative
  let { events: coopEvents } = await getEventsByCooperative(currentMember.cooperativeId);
  
  if (coopEvents && coopEvents.length === 0) {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(events).values([
        {
          cooperativeId: currentMember.cooperativeId,
          name: "Kerja Bakti Balai Desa",
          description: "Mari bergotong-royong membersihkan area balai desa. Dapatkan XP dan poin tambahan bagi yang hadir!",
          startDate: nextWeek,
          endDate: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000), // +4 hours
        },
        {
          cooperativeId: currentMember.cooperativeId,
          name: "Pelatihan Literasi Keuangan",
          description: "Tingkatkan pengetahuan finansialmu bersama pakar ekonomi koperasi kita. Gratis untuk semua anggota.",
          startDate: nextMonth,
          endDate: new Date(nextMonth.getTime() + 2 * 60 * 60 * 1000), // +2 hours
        }
      ]);
      const fetchedEvents = await getEventsByCooperative(currentMember.cooperativeId);
      coopEvents = fetchedEvents.events;
    } catch (e) {
      console.error("Failed to seed events", e);
    }
  }

  const { participations } = await getMemberEventParticipations(currentMember.id);
  const joinedEventIds = new Set(participations?.map(p => p.event.id) || []);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background p-6 md:p-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg mb-2">Event Koperasi</h1>
        <p className="text-on-surface-variant font-body-lg">
          Ikuti kegiatan komunitas, perluas jaringan, dan kumpulkan poin XP tambahan!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {coopEvents?.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isJoined={joinedEventIds.has(event.id)}
            memberId={currentMember.id}
          />
        ))}
        {coopEvents?.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container rounded-xl border border-dashed border-outline">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
            <p>Belum ada event yang diselenggarakan oleh koperasimu.</p>
          </div>
        )}
      </div>
    </main>
  );
}
