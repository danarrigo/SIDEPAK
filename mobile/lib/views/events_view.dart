import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/event_model.dart';
import 'widgets/create_event_form.dart';

class EventsView extends StatefulWidget {
  const EventsView({super.key});

  @override
  State<EventsView> createState() => _EventsViewState();
}

class _EventsViewState extends State<EventsView> {
  DateTime _selectedDate = DateTime.now();

  List<DateTime> _getWeekDays() {
    final today = DateTime.now();
    final base = DateTime(today.year, today.month, today.day);
    return List.generate(7, (i) => base.add(Duration(days: i)));
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  String _dayLabel(int weekday) {
    const labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return labels[weekday % 7];
  }

  String _formatFullDate(DateTime d) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return '${days[d.weekday - 1]}, ${d.day} ${months[d.month - 1]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final weekDays = _getWeekDays();
    final selectedDayEvents = provider.events
        .where((e) => e.occursOn(_selectedDate))
        .toList();
    final canCreate = provider.level >= 20;

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: Stack(
        children: [
          SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: const Color(0xFF0F172A),
                  padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 24),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Event Koperasi',
                        style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Kegiatan komunitas & acara desa',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Weekly Calendar
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Kalender Mingguan',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                                GestureDetector(
                                  onTap: () => setState(() {
                                    _selectedDate = DateTime.now();
                                  }),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFACC15).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'Hari Ini',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: weekDays.map((day) {
                                final isSelected = _isSameDay(day, _selectedDate);
                                final isToday = _isSameDay(day, DateTime.now());
                                final hasEvents = provider.events.any((e) => e.occursOn(day));
                                return Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _selectedDate = day),
                                    child: Container(
                                      margin: const EdgeInsets.symmetric(horizontal: 2),
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? const Color(0xFFFACC15)
                                            : isToday
                                                ? const Color(0xFFFACC15).withOpacity(0.1)
                                                : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                        border: isToday && !isSelected
                                            ? Border.all(color: const Color(0xFFFACC15), width: 1)
                                            : null,
                                      ),
                                      child: Column(
                                        children: [
                                          Text(
                                            _dayLabel(day.weekday),
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: isSelected ? const Color(0xFF0F172A) : Colors.grey,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${day.day}',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w900,
                                              color: isSelected
                                                  ? const Color(0xFF0F172A)
                                                  : isToday
                                                      ? const Color(0xFFB45309)
                                                      : const Color(0xFF1E293B),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Container(
                                            width: 5,
                                            height: 5,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: hasEvents
                                                  ? (isSelected ? const Color(0xFF0F172A) : const Color(0xFFFACC15))
                                                  : Colors.transparent,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Text(
                          'Jadwal: ${_formatFullDate(_selectedDate)}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (selectedDayEvents.isEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFCBD5E1), width: 2),
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.event_busy, color: Colors.grey, size: 36),
                              SizedBox(height: 8),
                              Text(
                                'Tidak ada event di hari ini.',
                                style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      else
                        ...selectedDayEvents.map((e) => _EventCard(event: e)),
                      const SizedBox(height: 24),
                      if (canCreate)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFACC15).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFFACC15)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.emoji_events, color: Color(0xFFB45309), size: 18),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Anda dapat membuat event baru (Level 20+).',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.lock, color: Colors.grey, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Pembuatan event hanya untuk Level 20+ (Emas). Level Anda: ${provider.level} (${provider.rankName}).',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (canCreate)
            Positioned(
              right: 16,
              bottom: 16,
              child: FloatingActionButton.extended(
                heroTag: 'ev-fab',
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (ctx) => const CreateEventForm(),
                  );
                },
                backgroundColor: const Color(0xFFFACC15),
                foregroundColor: const Color(0xFF0F172A),
                icon: const Icon(Icons.add),
                label: const Text('Buat Event', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
        ],
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final EventModel event;
  const _EventCard({required this.event});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final isJoined = provider.joinedEventIds.contains(event.id);

    void showSnack(String msg, {bool isError = false}) {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: isError ? Colors.red : Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFACC15).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFFACC15)),
                      ),
                      child: const Text(
                        'EVENT KOPERASI',
                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                      ),
                    ),
                    const Spacer(),
                    if (event.isOngoing)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'BERLANGSUNG',
                          style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                        ),
                      )
                    else if (event.isUpcoming)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDBEAFE),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'AKAN DATANG',
                          style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8)),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'SELESAI',
                          style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  event.name,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                ),
                if (event.description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    event.description,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 10),
                _InfoRow(
                  icon: Icons.calendar_today,
                  text: '${_formatDate(event.startDate)} • ${_formatTime(event.startDate)} - ${_formatTime(event.endDate)}',
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isJoined
                    ? null
                    : () async {
                        final msg = await provider.joinEvent(event.id);
                        showSnack(msg, isError: !msg.toLowerCase().contains('berhasil'));
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isJoined ? const Color(0xFFE2E8F0) : const Color(0xFF0F172A),
                  foregroundColor: isJoined ? Colors.grey : Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
                icon: Icon(isJoined ? Icons.check_circle : Icons.person_add, size: 14),
                label: Text(
                  isJoined ? 'Terdaftar' : 'Ikut Event',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }

  String _formatTime(DateTime d) {
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 12, color: Colors.grey),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}
