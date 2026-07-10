import { getCurrentMember } from "@/actions/members";
import { getDashboardData } from "@/actions/dashboard";
import { getEventsByCooperative, getMemberEventParticipations } from "@/actions/events";
import { redirect } from "next/navigation";
import EventCard from "@/components/EventCard";
import CreateEventForm from "@/components/CreateEventForm";

export default async function EventsPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const dbData = await getDashboardData(currentMember.id);
  const level = dbData?.progress?.level || 1;

  if (!currentMember || !currentMember.cooperativeId) redirect("/login");

  const eventsResult = await getEventsByCooperative(currentMember.cooperativeId);
  const participationsResult = await getMemberEventParticipations(currentMember.id);

  const events = eventsResult.success && eventsResult.events ? eventsResult.events : [];
  const participations = participationsResult.success && participationsResult.participations ? participationsResult.participations : [];
  
  const joinedEventIds = new Set(participations.map((p: any) => p.event.id));

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-black text-on-surface mb-2">Event Komunitas</h1>
            <p className="text-on-surface-variant">
              Ikuti event untuk mendapatkan poin tambahan dan membangun koperasi kita bersama.
            </p>
          </div>
          <CreateEventForm memberId={currentMember.id} level={level} />
        </div>

        {events.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center animate-slide-up delay-100 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">event_busy</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Belum ada event</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Saat ini belum ada event komunitas yang diselenggarakan oleh koperasi Anda. Tunggu informasi selanjutnya!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up delay-100">
            {events.map((event) => (
              <EventCard 
                key={event.id}
                event={event}
                isJoined={joinedEventIds.has(event.id)}
                memberId={currentMember.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
