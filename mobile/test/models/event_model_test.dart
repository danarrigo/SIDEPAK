import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/event_model.dart';

void main() {
  group('EventModel.fromJson', () {
    test('parses complete ISO date strings', () {
      final e = EventModel.fromJson({
        'id': 1,
        'name': 'Senam Pagi',
        'description': 'Olahraga bersama',
        'startDate': '2026-07-01T07:00:00.000Z',
        'endDate': '2026-07-01T09:00:00.000Z',
        'cooperativeId': 1,
        'creatorId': 4,
      });
      expect(e.id, 1);
      expect(e.name, 'Senam Pagi');
      expect(e.description, 'Olahraga bersama');
      expect(e.cooperativeId, 1);
      expect(e.creatorId, 4);
      expect(e.startDate.year, 2026);
      expect(e.endDate.hour, 9);
    });

    test('defaults description to empty string', () {
      final e = EventModel.fromJson({
        'id': 2,
        'name': 'X',
        'startDate': '2026-07-01T07:00:00.000Z',
        'endDate': '2026-07-01T08:00:00.000Z',
        'cooperativeId': 1,
      });
      expect(e.description, '');
      expect(e.creatorId, isNull);
    });
  });

  group('EventModel.occursOn', () {
    EventModel ev(DateTime start, DateTime end) => EventModel(
          id: 1,
          name: 'X',
          startDate: start,
          endDate: end,
          cooperativeId: 1,
        );

    test('returns true for day inside range', () {
      final e = ev(DateTime(2026, 7, 1), DateTime(2026, 7, 5));
      expect(e.occursOn(DateTime(2026, 7, 3)), isTrue);
    });

    test('returns true on the boundary days', () {
      final e = ev(DateTime(2026, 7, 1), DateTime(2026, 7, 5));
      expect(e.occursOn(DateTime(2026, 7, 1)), isTrue);
      expect(e.occursOn(DateTime(2026, 7, 5)), isTrue);
    });

    test('returns false outside range', () {
      final e = ev(DateTime(2026, 7, 1), DateTime(2026, 7, 5));
      expect(e.occursOn(DateTime(2026, 6, 30)), isFalse);
      expect(e.occursOn(DateTime(2026, 7, 6)), isFalse);
    });

    test('is independent of time of day', () {
      final e = ev(
        DateTime(2026, 7, 1, 23, 59),
        DateTime(2026, 7, 3, 0, 1),
      );
      expect(e.occursOn(DateTime(2026, 7, 2)), isTrue);
    });
  });

  group('EventModel status flags', () {
    test('isOngoing true between start and end', () {
      final e = EventModel(
        id: 1,
        name: 'X',
        startDate: DateTime.now().subtract(const Duration(hours: 1)),
        endDate: DateTime.now().add(const Duration(hours: 1)),
        cooperativeId: 1,
      );
      expect(e.isOngoing, isTrue);
      expect(e.isUpcoming, isFalse);
      expect(e.isPast, isFalse);
    });

    test('isUpcoming true before start', () {
      final e = EventModel(
        id: 1,
        name: 'X',
        startDate: DateTime.now().add(const Duration(days: 1)),
        endDate: DateTime.now().add(const Duration(days: 2)),
        cooperativeId: 1,
      );
      expect(e.isUpcoming, isTrue);
      expect(e.isOngoing, isFalse);
    });

    test('isPast true after end', () {
      final e = EventModel(
        id: 1,
        name: 'X',
        startDate: DateTime.now().subtract(const Duration(days: 2)),
        endDate: DateTime.now().subtract(const Duration(days: 1)),
        cooperativeId: 1,
      );
      expect(e.isPast, isTrue);
      expect(e.isOngoing, isFalse);
      expect(e.isUpcoming, isFalse);
    });
  });
}
