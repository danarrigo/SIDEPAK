class EventModel {
  final int id;
  final String name;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final int cooperativeId;
  final int? creatorId;

  EventModel({
    required this.id,
    required this.name,
    this.description = '',
    required this.startDate,
    required this.endDate,
    required this.cooperativeId,
    this.creatorId,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      startDate: _parseDate(json['startDate']),
      endDate: _parseDate(json['endDate']),
      cooperativeId: (json['cooperativeId'] as num?)?.toInt() ?? 0,
      creatorId: (json['creatorId'] as num?)?.toInt(),
    );
  }

  static DateTime _parseDate(dynamic raw) {
    if (raw == null) return DateTime.now();
    if (raw is DateTime) return raw;
    return DateTime.tryParse(raw.toString()) ?? DateTime.now();
  }

  bool get isOngoing {
    final now = DateTime.now();
    return now.isAfter(startDate) && now.isBefore(endDate);
  }

  bool get isUpcoming => DateTime.now().isBefore(startDate);

  bool get isPast => DateTime.now().isAfter(endDate);

  bool occursOn(DateTime day) {
    final start = DateTime(startDate.year, startDate.month, startDate.day);
    final end = DateTime(endDate.year, endDate.month, endDate.day);
    final target = DateTime(day.year, day.month, day.day);
    return !target.isBefore(start) && !target.isAfter(end);
  }
}
