import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/koperasi_provider.dart';
import 'views/home_view.dart';
import 'views/misi_view.dart';
import 'views/battle_view.dart';
import 'views/koperasi_view.dart';
import 'views/profile_view.dart';
import 'views/login_view.dart';
import 'views/marketplace_view.dart';
import 'views/events_view.dart';
import 'views/widgets/prank_overlay.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => KoperasiProvider(),
      child: MaterialApp(
        title: 'Koperasi Sukamaju',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.light,
          primaryColor: const Color(0xFF0F172A),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF0F172A),
            primary: const Color(0xFF0F172A),
            secondary: const Color(0xFFFACC15),
          ),
          fontFamily: 'Inter',
          useMaterial3: true,
        ),
        home: Consumer<KoperasiProvider>(
          builder: (context, provider, _) => provider.isLoggedIn ? const MainNavigationWrapper() : const LoginView(),
        ),
      ),
    );
  }
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return HomeView(
          onNavigate: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
        );
      case 1:
        return const MisiView();
      case 2:
        return const BattleView();
      case 3:
        return const MarketplaceView();
      case 4:
        return const EventsView();
      case 5:
        return const KoperasiView();
      case 6:
        return ProfileView(
          onLogout: () {
            Provider.of<KoperasiProvider>(context, listen: false).logout();
          },
        );
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: Stack(
        children: [
          provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildBody(),
          // Phase 4b: PrankEffect overlay
          const PrankOverlay(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0B1120),
          border: Border(top: BorderSide(color: Colors.white10, width: 0.5)),
          boxShadow: [
            BoxShadow(color: Colors.black45, blurRadius: 20, offset: Offset(0, -4))
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildNavItem(0, Icons.home_rounded, 'Beranda'),
              _buildNavItem(1, Icons.assignment_rounded, 'Misi'),
              _buildNavItem(2, Icons.bolt_rounded, 'Arena'),
              _buildNavItem(3, Icons.storefront_rounded, 'Pasar'),
              _buildNavItem(4, Icons.event_rounded, 'Event'),
              _buildNavItem(5, Icons.account_balance_rounded, 'Koperasi'),
              _buildNavItem(6, Icons.person_rounded, 'Profil'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isActive = _currentIndex == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          padding: EdgeInsets.symmetric(vertical: isActive ? 6 : 4, horizontal: 1),
          decoration: isActive
              ? BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFFACC15).withOpacity(0.18), blurRadius: 8, offset: const Offset(0, 3)),
                  ],
                )
              : const BoxDecoration(color: Colors.transparent),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                child: Icon(
                  icon,
                  color: isActive ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                  size: isActive ? 22 : 20,
                  shadows: isActive
                      ? [Shadow(color: const Color(0xFFFACC15).withOpacity(0.5), blurRadius: 8)]
                      : null,
                ),
              ),
              const SizedBox(height: 2),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  color: isActive ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                  fontSize: isActive ? 9 : 8,
                  fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
                  fontFamily: 'Inter',
                ),
                child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
