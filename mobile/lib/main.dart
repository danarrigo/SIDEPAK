import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'providers/koperasi_provider.dart';
import 'views/home_view.dart';
import 'views/misi_view.dart';
import 'views/battle_view.dart';
import 'views/koperasi_view.dart';
import 'views/profile_view.dart';
import 'views/login_view.dart';
import 'views/marketplace_view.dart';
import 'views/widgets/prank_overlay.dart';
import 'views/widgets/onboarding_paywall.dart';
import 'views/simpanan_view.dart';

import 'views/admin/admin_navigation_wrapper.dart';

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
        title: 'SIDEPAK',
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
          builder: (context, provider, _) {
            if (!provider.isLoggedIn) {
              return const LoginView();
            }
            if (provider.role == 'admin') {
              return const AdminNavigationWrapper();
            }
            return const MainNavigationWrapper();
          },
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

  @override
  void initState() {
    super.initState();
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
        return const MarketplaceView();
      case 4:
        return const KoperasiView();
      case 5:
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
    final showPaywall =
        !provider.isPokokPaid && _currentIndex != 4 && provider.isLoggedIn;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: Stack(
        children: [
          provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildBody(),
          // Phase 4b: PrankEffect overlay
          const PrankOverlay(),

          if (showPaywall && !provider.isLoading)
            OnboardingPaywall(
              onPay: () async {
                final urlString = await provider.createTopUpInvoice(100000);
                if (urlString != null) {
                  final url = Uri.parse(urlString);
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Gagal membuat invoice Xendit')),
                  );
                }
              },
              onSuccess: () {
                setState(() {
                  _currentIndex = 4;
                });
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SimpananView()),
                ).then((_) {
                  provider.fetchData();
                });
              },
            ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0B1120),
          border: Border(top: BorderSide(color: Colors.white10, width: 0.5)),
          boxShadow: [
            BoxShadow(
                color: Colors.black45, blurRadius: 20, offset: Offset(0, -4))
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
              _buildNavItem(4, Icons.account_balance_rounded, 'Koperasi'),
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
          padding:
              EdgeInsets.symmetric(vertical: isActive ? 6 : 4, horizontal: 1),
          decoration: isActive
              ? BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                        color: const Color(0xFFFACC15).withOpacity(0.18),
                        blurRadius: 8,
                        offset: const Offset(0, 3)),
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
                  color: isActive
                      ? const Color(0xFFFACC15)
                      : const Color(0xFF64748B),
                  size: isActive ? 22 : 20,
                  shadows: isActive
                      ? [
                          Shadow(
                              color: const Color(0xFFFACC15).withOpacity(0.5),
                              blurRadius: 8)
                        ]
                      : null,
                ),
              ),
              const SizedBox(height: 2),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  color: isActive
                      ? const Color(0xFFFACC15)
                      : const Color(0xFF64748B),
                  fontSize: isActive ? 9 : 8,
                  fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
                  fontFamily: 'Inter',
                ),
                child:
                    Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
