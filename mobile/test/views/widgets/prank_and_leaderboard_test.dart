import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:mobile/views/widgets/prank_overlay.dart';
import 'package:mobile/views/widgets/leaderboard_section.dart';
import 'package:provider/provider.dart';

class _StubProvider extends ChangeNotifier implements KoperasiProvider {
  String? _activeEffect;
  final List<dynamic> _lbKoperasi;
  final List<dynamic> _lbProv;
  final List<dynamic> _lbNas;
  _StubProvider({String? activeEffect, List<dynamic>? lbKoperasi, List<dynamic>? lbProv, List<dynamic>? lbNas})
      : _activeEffect = activeEffect,
        _lbKoperasi = lbKoperasi ?? const [],
        _lbProv = lbProv ?? const [],
        _lbNas = lbNas ?? const [];

  @override
  String? get activeEffect => _activeEffect;
  @override
  set activeEffect(String? v) {
    _activeEffect = v;
    notifyListeners();
  }

  @override
  int? get memberId => 1;
  @override
  List<dynamic> get leaderboardByKoperasi => _lbKoperasi;
  @override
  List<dynamic> get leaderboardByProvinsi => _lbProv;
  @override
  List<dynamic> get leaderboardByNasional => _lbNas;
  @override
  int get points => 0;
  @override
  List<dynamic> get leaderboard => _lbKoperasi;
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
  group('PrankOverlay', () {
    testWidgets('renders nothing when no active effect', (tester) async {
      final p = _StubProvider();
      await tester.pumpWidget(_wrap(const PrankOverlay(), p));
      await tester.pump();
      expect(find.text('💥 KENA PRANK! 💥'), findsNothing);
    });

    testWidgets('renders shake banner with effect name when active effect is set', (tester) async {
      final p = _StubProvider(activeEffect: 'Sakit Jantung');
      // PrankOverlay uses Positioned.fill, so it must be inside a Stack
      await tester.pumpWidget(_wrap(
        const Stack(children: [PrankOverlay()]),
        p,
      ));
      // Allow postFrame callback to fire
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(find.text('💥 KENA PRANK! 💥'), findsOneWidget);
      expect(find.textContaining('Sakit Jantung'), findsOneWidget);
      // Unmount to dispose the periodic poll timer (avoids pending timer error)
      await tester.pumpWidget(const SizedBox.shrink());
    });
  });

  group('LeaderboardSection', () {
    testWidgets('renders empty state when no data', (tester) async {
      final p = _StubProvider();
      await tester.pumpWidget(_wrap(
        SingleChildScrollView(child: LeaderboardSection(provider: p)),
        p,
      ));
      await tester.pump();
      expect(find.text('Papan Peringkat'), findsOneWidget);
      expect(find.text('Koperasi'), findsOneWidget);
      expect(find.text('Provinsi'), findsOneWidget);
      expect(find.text('Nasional'), findsOneWidget);
      expect(find.textContaining('Belum ada data'), findsOneWidget);
    });

    testWidgets('renders top rows with ANDA badge for current member', (tester) async {
      final p = _StubProvider(
        lbKoperasi: [
          {'id': 1, 'namaLengkap': 'Saya', 'level': 5, 'xp': 500, 'pointsBalance': 100},
          {'id': 2, 'namaLengkap': 'Andi', 'level': 3, 'xp': 300, 'pointsBalance': 50},
        ],
      );
      await tester.pumpWidget(_wrap(
        SingleChildScrollView(child: LeaderboardSection(provider: p)),
        p,
      ));
      await tester.pump();
      expect(find.text('Saya'), findsOneWidget);
      expect(find.text('Andi'), findsOneWidget);
      expect(find.text('ANDA'), findsOneWidget); // highlight
    });

    testWidgets('switches to Provinsi scope on tab tap', (tester) async {
      final p = _StubProvider(
        lbKoperasi: [{'id': 1, 'namaLengkap': 'X', 'level': 1, 'xp': 10, 'pointsBalance': 5}],
        lbProv: [
          {'id': 2, 'namaLengkap': 'Y-Prov', 'level': 4, 'xp': 40, 'pointsBalance': 20},
          {'id': 3, 'namaLengkap': 'Z-Prov', 'level': 3, 'xp': 30, 'pointsBalance': 15},
        ],
      );
      await tester.pumpWidget(_wrap(
        SingleChildScrollView(child: LeaderboardSection(provider: p)),
        p,
      ));
      await tester.pump();
      expect(find.text('X'), findsOneWidget);
      await tester.tap(find.text('Provinsi'));
      await tester.pump();
      expect(find.text('Y-Prov'), findsOneWidget);
      expect(find.text('Z-Prov'), findsOneWidget);
    });
  });
}
