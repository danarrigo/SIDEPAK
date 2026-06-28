import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:mobile/views/members_directory_view.dart';
import 'package:mobile/views/member_detail_view.dart';
import 'package:provider/provider.dart';

class _StubProvider extends ChangeNotifier implements KoperasiProvider {
  final List<Map<String, dynamic>> _members;
  final int _memberId;
  _StubProvider({List<Map<String, dynamic>>? members, int memberId = 99})
      : _members = members ?? [],
        _memberId = memberId;

  @override
  List<Map<String, dynamic>> get activeMembers => _members;
  @override
  int? get memberId => _memberId;
  @override
  int get points => 0;
  @override
  List<dynamic> get leaderboardByKoperasi => const [];

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
  testWidgets('MembersDirectoryView shows empty state', (tester) async {
    final p = _StubProvider();
    await tester.pumpWidget(_wrap(const MembersDirectoryView(), p));
    await tester.pump();
    expect(find.text('Daftar Anggota'), findsOneWidget);
    expect(find.text('Belum ada anggota aktif.'), findsOneWidget);
  });

  testWidgets('MembersDirectoryView renders list with ANDA highlight', (tester) async {
    final p = _StubProvider(
      members: [
        {'id': 99, 'namaLengkap': 'Budi Santoso', 'nomorAnggota': 'A001', 'desa': 'Sukamaju', 'kecamatan': 'Tegalsari'},
        {'id': 88, 'namaLengkap': 'Andi Wijaya', 'nomorAnggota': 'A002', 'desa': 'Sukamaju', 'kecamatan': 'Tegalsari'},
      ],
      memberId: 99,
    );
    await tester.pumpWidget(_wrap(const MembersDirectoryView(), p));
    await tester.pump();
    expect(find.text('Budi Santoso'), findsOneWidget);
    expect(find.text('Andi Wijaya'), findsOneWidget);
    expect(find.text('No. A001'), findsOneWidget);
    expect(find.text('ANDA'), findsOneWidget); // highlight badge for self
  });

  testWidgets('MemberDetailView shows all identity sections', (tester) async {
    // Expand viewport so all slivers are built (Koperasi section is below the fold)
    tester.view.physicalSize = const Size(800, 1800);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    final p = _StubProvider();
    const member = {
      'id': 5,
      'namaLengkap': 'Siti Aminah',
      'nomorAnggota': 'A003',
      'nik': '3201234567890004',
      'statusAnggota': 'active',
      'provinsi': 'Jawa Barat',
      'kabupaten': 'Bandung',
      'kecamatan': 'Cileunyi',
      'desa': 'Sukamaju',
      'koperasi': 'Koperasi Sukamaju',
    };
    await tester.pumpWidget(_wrap(const MemberDetailView(member: member), p));
    await tester.pump();
    expect(find.text('Siti Aminah'), findsOneWidget);
    expect(find.text('3201234567890004'), findsOneWidget);
    expect(find.text('No. A003'), findsOneWidget);
    expect(find.text('ACTIVE'), findsOneWidget);
    expect(find.text('Jawa Barat'), findsOneWidget);
    expect(find.text('Bandung'), findsOneWidget);
    expect(find.text('Cileunyi'), findsOneWidget);
    expect(find.text('Sukamaju'), findsOneWidget);
    expect(find.text('Koperasi Sukamaju'), findsOneWidget);
  });

  testWidgets('MemberDetailView shows ANDA badge for self', (tester) async {
    final p = _StubProvider(memberId: 5);
    const member = {
      'id': 5,
      'namaLengkap': 'Saya Sendiri',
      'nomorAnggota': 'A099',
      'statusAnggota': 'active',
    };
    await tester.pumpWidget(_wrap(const MemberDetailView(member: member), p));
    await tester.pump();
    expect(find.text('ANDA'), findsOneWidget);
  });
}
