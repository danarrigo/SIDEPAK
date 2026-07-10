import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('App boots and shows LoginView when not logged in',
      (tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pump();
    expect(find.text('SIDEPAK'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
    // 'Daftar Sekarang' is part of the longer string 'Belum memiliki akun? Daftar Sekarang'
    expect(find.textContaining('Daftar Sekarang'), findsOneWidget);
  });

  testWidgets('MainNavigationWrapper renders 5 bottom nav items when logged in',
      (tester) async {
    final fake = ChangeNotifierProvider<KoperasiProvider>(
      create: (_) {
        // Bypass real loadSavedSession to keep test deterministic
        final p = KoperasiProvider();
        p.isLoggedIn = true;
        p.memberId = 1;
        p.fullName = 'Tester';
        return p;
      },
      child: const MaterialApp(home: MainNavigationWrapper()),
    );
    await tester.pumpWidget(fake);
    // Render initial loading spinner
    await tester.pump();
    // All 5 nav labels should be present (Event and Profil were moved out)
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Misi'), findsOneWidget);
    expect(find.text('Arena'), findsOneWidget);
    expect(find.text('Pasar'), findsOneWidget);
    expect(find.text('Koperasi'), findsOneWidget);

    // Event tab and Profil tab no longer exist in the bottom nav
    expect(find.text('Event'), findsNothing);
    expect(find.text('Profil'), findsNothing);
  });
}
