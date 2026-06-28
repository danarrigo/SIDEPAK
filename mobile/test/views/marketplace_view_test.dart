import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/marketplace_item.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:mobile/views/marketplace_view.dart';
import 'package:mobile/views/widgets/marketplace_list_form.dart';
import 'package:provider/provider.dart';

class _StubProvider extends ChangeNotifier implements KoperasiProvider {
  int _points;
  final List<MarketplaceItem> _items;
  final int? _memberId;
  _StubProvider({int points = 1000, int? memberId = 99, List<MarketplaceItem> items = const []})
      : _points = points,
        _items = items,
        _memberId = memberId;

  @override
  List<MarketplaceItem> get marketplaceItems => _items;

  @override
  int get points => _points;

  @override
  int? get memberId => _memberId;

  // No-op stubs for required methods
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

  // No-op field overrides (return defaults)
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

Widget _wrap(Widget child, KoperasiProvider p) => ChangeNotifierProvider<KoperasiProvider>.value(
      value: p,
      child: MaterialApp(home: child),
    );

void main() {
  testWidgets('MarketplaceView shows empty state when no items', (tester) async {
    final p = _StubProvider(items: [], memberId: 99);
    await tester.pumpWidget(_wrap(const MarketplaceView(), p));
    await tester.pump();
    expect(find.text('Marketplace'), findsOneWidget);
    expect(find.textContaining('Belum ada barang'), findsOneWidget);
    expect(find.text('Jual Barang'), findsOneWidget);
  });

  testWidgets('MarketplaceView renders items with seller + price + stock', (tester) async {
    final items = [
      MarketplaceItem(
        id: 1,
        name: 'Buku Tulis',
        description: 'Buku 50 lembar',
        priceInPoints: 100,
        stock: 5,
        sellerId: 88,
        sellerName: 'Andi',
      ),
      MarketplaceItem(
        id: 2,
        name: 'Tas Anyaman',
        description: 'Tas handmade',
        priceInPoints: 250,
        stock: 0,
        sellerId: 88,
        sellerName: 'Andi',
      ),
    ];
    final p = _StubProvider(items: items, memberId: 99);
    await tester.pumpWidget(_wrap(const MarketplaceView(), p));
    await tester.pump();
    expect(find.text('Buku Tulis'), findsOneWidget);
    expect(find.text('Tas Anyaman'), findsOneWidget);
    expect(find.text('Oleh Andi'), findsNWidgets(2));
    // Sisa 5 / Sisa 0
    expect(find.text('Sisa 5'), findsOneWidget);
    expect(find.text('Sisa 0'), findsOneWidget);
    // Beli / Habis
    expect(find.text('Beli'), findsOneWidget);
    expect(find.text('Habis'), findsOneWidget);
  });

  testWidgets('MarketplaceView shows "Barang Anda" badge for own items', (tester) async {
    final items = [
      MarketplaceItem(
        id: 5,
        name: 'Produk Saya',
        description: '',
        priceInPoints: 50,
        stock: 3,
        sellerId: 99,
        sellerName: 'Saya',
      ),
    ];
    final p = _StubProvider(items: items, memberId: 99);
    await tester.pumpWidget(_wrap(const MarketplaceView(), p));
    await tester.pump();
    expect(find.text('Barang Anda'), findsOneWidget);
    expect(find.text('Anda'), findsOneWidget);
  });

  testWidgets('MarketplaceListForm validates empty name', (tester) async {
    final p = _StubProvider();
    await tester.pumpWidget(MaterialApp(
      home: ChangeNotifierProvider<KoperasiProvider>.value(
        value: p,
        child: const Scaffold(body: MarketplaceListForm()),
      ),
    ));
    await tester.pump();
    // Tap submit button without entering name
    await tester.tap(find.text('Posting Barang'));
    await tester.pump();
    expect(find.text('Nama barang wajib diisi.'), findsOneWidget);
  });
}
