import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/history_item.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:mobile/views/battle_view.dart';
import 'package:provider/provider.dart';

class _StubProvider extends ChangeNotifier implements KoperasiProvider {
  final Map<String, dynamic>? _activeBattle;
  final List<HistoryItem> _history;
  bool matchmakeCalled = false;
  String matchmakeReturnMessage;
  _StubProvider({Map<String, dynamic>? activeBattle, List<HistoryItem>? history, this.matchmakeReturnMessage = 'Lawan ditemukan!'})
      : _activeBattle = activeBattle,
        _history = history ?? const [];

  @override
  Map<String, dynamic>? get activeBattle => _activeBattle;
  @override
  String? get activeBattleEndDate => _activeBattle?['endDate']?.toString();
  @override
  List<HistoryItem> get historyList => _history;
  @override
  int? get memberId => 1;
  @override
  String? get fullName => 'Budi Test';
  @override
  int get streak => 5;
  @override
  int get points => 0;
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
  Future<String> matchmakeBattle() async {
    matchmakeCalled = true;
    return matchmakeReturnMessage;
  }
  @override
  Future<String?> checkActiveEffect() async => null;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

Widget _wrap(Widget child, KoperasiProvider p) => ChangeNotifierProvider<KoperasiProvider>.value(
      value: p,
      child: MaterialApp(home: Scaffold(body: child)),
    );

void main() {
  testWidgets('BattleView shows empty state with Cari Lawan button when no active battle', (tester) async {
    final p = _StubProvider();
    await tester.pumpWidget(_wrap(const BattleView(), p));
    await tester.pump();
    expect(find.text('Belum Ada Pertandingan'), findsOneWidget);
    expect(find.text('CARI LAWAN SEKARANG'), findsOneWidget);
  });

  testWidgets('Tapping Cari Lawan triggers matchmakeBattle', (tester) async {
    final p = _StubProvider(matchmakeReturnMessage: 'Lawan ditemukan!');
    await tester.pumpWidget(_wrap(const BattleView(), p));
    await tester.pump();
    await tester.tap(find.text('CARI LAWAN SEKARANG'));
    // Let the async matchmake + refetchData + setState complete
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));
    await tester.pump(const Duration(milliseconds: 50));
    expect(p.matchmakeCalled, isTrue);
  });

  testWidgets('BattleView shows "Riwayat Bertanding" history list when history exists', (tester) async {
    final p = _StubProvider(
      activeBattle: {
        'id': 1,
        'challengerId': 1,
        'opponentId': 2,
        'challengerPoints': 100,
        'opponentPoints': 50,
        'endDate': '2026-06-29T23:59:00Z',
        'opponent': {'namaLengkap': 'Andi'},
        'challenger': {'namaLengkap': 'Budi Test'},
      },
      history: [
        HistoryItem(opponent: 'Andi', result: 'Menang', points: 100, date: '2026-06-22'),
      ],
    );
    await tester.pumpWidget(_wrap(const BattleView(), p));
    await tester.pump();
    expect(find.text('Battle Minggu Ini'), findsOneWidget);
    expect(find.text('Menang'), findsOneWidget);
    expect(find.text('vs Andi'), findsOneWidget);
  });
}
