import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';
import '../../models/event_model.dart';

/// Compact weekly event calendar embedded in the home dashboard
/// (mirrors the desktop's WeeklyCalendar.tsx component).
///
/// Shows the current week (today + 6 days). Each day cell is tappable;
/// the cell shows how many events occur on that day. Below the day
/// strip, a list of events for the currently selected day is rendered.
class WeeklyEventCalendar extends StatefulWidget {
  /// Called when the user taps "Lihat semua event" — typically used to
  /// push the full EventsView page.
  final VoidCallback? onSeeAll;

  const WeeklyEventCalendar({super.key, this.onSeeAll});

  @override
  State<WeeklyEventCalendar> createState() => _WeeklyEventCalendarState();
}

class _WeeklyEventCalendarState extends State<WeeklyEventCalendar> {
  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedDate = DateTime(now.year, now.month, now.day);
  }

  List<DateTime> _getWeekDays() {
    final now = DateTime.now();
    final base = DateTime(now.year, now.month, now.day);
    return List.generate(7, (i) => base.add(Duration(days: i)));
  }

  String _dayLabel(int weekday) {
    const labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return labels[weekday % 7];
  }

  String _monthShort(int month) {
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return labels[(month - 1).clamp(0, 11)];
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  int _eventsOnDay(List<EventModel> events, DateTime day) =>
      events.where((e) => e.occursOn(day)).length;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final weekDays = _getWeekDays();
    final eventsForSelected = provider.events
        .where((e) => e.occursOn(_selectedDate))
        .toList()
      ..sort((a, b) => a.startDate.compareTo(b.startDate));

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Kalender Event',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              if (widget.onSeeAll != null)
                GestureDetector(
                  onTap: widget.onSeeAll,
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Lihat semua',
                        style: TextStyle(
                          color: Color(0xFFFBBF24),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward,
                          size: 12, color: Color(0xFFFBBF24)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          // 7-day strip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: weekDays.map((day) {
              final isSelected = _isSameDay(day, _selectedDate);
              final isToday = _isSameDay(day, DateTime.now());
              final count = _eventsOnDay(provider.events, day);

              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedDate = day),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFFBBF24)
                          : isToday
                              ? const Color(0xFFFEF3C7)
                              : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      border: isToday && !isSelected
                          ? Border.all(color: const Color(0xFFFBBF24), width: 1)
                          : null,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _dayLabel(day.weekday),
                          style: TextStyle(
                            color: isSelected
                                ? const Color(0xFF0F172A)
                                : Colors.grey,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${day.day}',
                          style: TextStyle(
                            color: isSelected
                                ? const Color(0xFF0F172A)
                                : const Color(0xFF0F172A),
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _monthShort(day.month),
                          style: TextStyle(
                            color: isSelected
                                ? const Color(0xFF0F172A)
                                : Colors.grey,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (count > 0) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFFFBBF24),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$count',
                              style: TextStyle(
                                color: isSelected
                                    ? const Color(0xFFFBBF24)
                                    : const Color(0xFF0F172A),
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ] else
                          const SizedBox(height: 9),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          // Selected day events
          Text(
            'Event pada ${_dayLabel(_selectedDate.weekday)}, ${_selectedDate.day} ${_monthShort(_selectedDate.month)}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 8),
          if (eventsForSelected.isEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.event_busy, color: Colors.grey, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tidak ada event di tanggal ini.',
                      style: TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                  ),
                ],
              ),
            )
          else
            ...eventsForSelected.map(
              (e) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _EventRow(event: e),
              ),
            ),
        ],
      ),
    );
  }
}

class _EventRow extends StatelessWidget {
  final EventModel event;
  const _EventRow({required this.event});

  String _formatTime(DateTime d) {
    final h = d.hour.toString().padLeft(2, '0');
    final m = d.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.read<KoperasiProvider>();
    final isJoined = provider.joinedEventIds.contains(event.id);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFFBBF24),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.event, color: Color(0xFF0F172A), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.name,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${_formatTime(event.startDate)} – ${_formatTime(event.endDate)}'
                  '${event.description.isNotEmpty ? '  •  ${event.description}' : ''}',
                  style: const TextStyle(
                    fontSize: 10,
                    color: Colors.grey,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          isJoined
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF22C55E),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Terdaftar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
              : GestureDetector(
                  onTap: () async {
                    final msg = await provider.joinEvent(event.id);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).clearSnackBars();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(msg,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold)),
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Ikut',
                      style: TextStyle(
                        color: Color(0xFFFBBF24),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
        ],
      ),
    );
  }
}
