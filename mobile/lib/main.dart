import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/koperasi_provider.dart';
import 'views/home_view.dart';
import 'views/misi_view.dart';
import 'views/battle_view.dart';
import 'views/koperasi_view.dart';
import 'views/profile_view.dart';
import 'views/login_view.dart';

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

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

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
        return const KoperasiView();
      case 4:
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
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildBody(),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0B1120),
          border: Border(top: BorderSide(color: Colors.white10, width: 0.5)),
          boxShadow: [
            BoxShadow(color: Colors.black45, blurRadius: 20, offset: Offset(0, -4))
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildNavItem(0, Icons.home, 'Beranda'),
              _buildNavItem(1, Icons.assignment, 'Misi'),
              _buildNavItem(2, Icons.bolt, 'Bertanding'),
              _buildNavItem(3, Icons.account_balance, 'Koperasi'),
              _buildNavItem(4, Icons.person, 'Profil'),
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
          padding: EdgeInsets.symmetric(vertical: isActive ? 8 : 6, horizontal: 2),
          decoration: isActive
              ? BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFFACC15).withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 4)),
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
                  size: isActive ? 28 : 24,
                  shadows: isActive
                      ? [Shadow(color: const Color(0xFFFACC15).withOpacity(0.5), blurRadius: 12)]
                      : null,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  color: isActive ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                  fontSize: isActive ? 10.5 : 9,
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
