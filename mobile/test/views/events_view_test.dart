import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/event_model.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:mobile/views/events_view.dart';
import 'package:provider/provider.dart';

class _StubProvider extends ChangeNotifier implements KoperasiProvider {
  final List<EventModel> _events;
  final Set<int> _joined;
  final int _level;
  _StubProvider({List<EventModel> events = const [], Set<int> joined = const {}, int level = 25})
      : _events = events,
        _joined = joined,
        _level = level;

  @override
  List<EventModel> get events => _events;
  @override
  Set<int> get joinedEventIds => _joined;
  @override
  int get level => _level;
  @override
  int get memberId => 1;
  @override
  int get points => 0;
  @override
  String get rankName => 'Emas';

  @override
  Future<void> fetchData() async {}
  @override
  Future<void> loadSavedSession() async {}
  @override
  Future<String?> login(String a, String b) async => null;
  @override
  Future<bool> signup({required String email, required String password, required String nik, required String fullName, String provinsi = '', String kabupaten = '', String kecamatan = '', String desa = '', required String koperasi}) async => true;
  @override
  Future<void> logout() async {}
  @override
  Future<String> claimMission(String id, int? questRewardPoints) async => '';
  @override
  Future<String> buyShopItem(item) async => '';
  @override
  Future<String> useInventoryItem(int itemId, {int? targetMemberId}) async => '';
  @override
  Future<String> submitVote(String choice) async => '';
  @override
  Future<String> submitProposal(String title, String description) async => '';
  @override
  Future<Map<String, dynamic>> createTopUp(int amount) async => {};
  @override
  Future<Map<String, dynamic>> verifyTopUp(String invoiceId) async => {};
  @override
  Future<String> payDuesFromWallet(String type) async => '';
  @override
  Future<String> depositSavingsFromWallet(int amount, String description) async => '';
  @override
  Future<String> listMarketplaceItem({required String name, String description = '', required int priceInPoints, required int stock, String? imageUrl}) async => '';
  @override
  Future<String> buyMarketplaceItem(int itemId) async => '';
  @override
  Future<String> joinEvent(int eventId) async => '';
  @override
  Future<String> createEvent({required String name, String description = '', required DateTime startDate, required DateTime endDate}) async => '';
  @override
  Future<String> matchmakeBattle() async => '';
  @override
  Future<String?> checkActiveEffect() async => null;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

Widget _wrap(Widget child, KoperasiProvider p) => ChangeNotifierProvider<KoperasiProvider>.value(
      value: p,
      child: MaterialApp(home: child),
    );

void main() {
  testWidgets('EventsView shows empty state when no events', (tester) async {
    final p = _StubProvider();
    await tester.pumpWidget(_wrap(const EventsView(), p));
    await tester.pump();
    expect(find.text('Event Koperasi'), findsOneWidget);
    expect(find.text('Kalender Mingguan'), findsOneWidget);
    expect(find.textContaining('Tidak ada event'), findsOneWidget);
    expect(find.text('Buat Event'), findsOneWidget); // FAB for L20+
  });

  testWidgets('EventsView renders event card with join button', (tester) async {
    final today = DateTime.now();
    final events = [
      EventModel(
        id: 1,
        name: 'Senam Pagi',
        description: 'Olahraga bersama',
        startDate: today,
        endDate: today.add(const Duration(hours: 2)),
        cooperativeId: 1,
      ),
    ];
    final p = _StubProvider(events: events, joined: const {}, level: 25);
    await tester.pumpWidget(_wrap(const EventsView(), p));
    await tester.pump();
    expect(find.text('Senam Pagi'), findsOneWidget);
    expect(find.text('Olahraga bersama'), findsOneWidget);
    expect(find.text('Ikut Event'), findsOneWidget);
  });

  testWidgets('EventsView shows "Terdaftar" for joined events', (tester) async {
    final today = DateTime.now();
    final events = [
      EventModel(
        id: 1,
        name: 'Sudah Terdaftar',
        description: '',
        startDate: today,
        endDate: today.add(const Duration(hours: 1)),
        cooperativeId: 1,
      ),
    ];
    final p = _StubProvider(events: events, joined: {1}, level: 25);
    await tester.pumpWidget(_wrap(const EventsView(), p));
    await tester.pump();
    expect(find.text('Terdaftar'), findsOneWidget);
    expect(find.text('Sudah Terdaftar'), findsOneWidget);
  });

  testWidgets('EventsView hides Create FAB for L<20', (tester) async {
    final p = _StubProvider(level: 5);
    await tester.pumpWidget(_wrap(const EventsView(), p));
    await tester.pump();
    // FAB should be absent
    expect(find.text('Buat Event'), findsNothing);
    // Lock message visible
    expect(find.textContaining('Pembuatan event hanya untuk'), findsOneWidget);
  });
}
