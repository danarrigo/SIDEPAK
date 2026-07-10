import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';
import 'admin_dashboard_view.dart';
import 'admin_members_view.dart';
import 'admin_profile_view.dart';

class AdminNavigationWrapper extends StatefulWidget {
  const AdminNavigationWrapper({super.key});

  @override
  State<AdminNavigationWrapper> createState() => _AdminNavigationWrapperState();
}

class _AdminNavigationWrapperState extends State<AdminNavigationWrapper> {
  int _currentIndex = 0;

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return const AdminDashboardView();
      case 1:
        return const AdminMembersView();
      case 2:
        return AdminProfileView(
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
            BoxShadow(
                color: Colors.black45, blurRadius: 20, offset: Offset(0, -4))
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildNavItem(0, Icons.dashboard_rounded, 'Dashboard'),
              _buildNavItem(1, Icons.groups_rounded, 'Anggota'),
              _buildNavItem(2, Icons.person_rounded, 'Profil'),
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
                  size: isActive ? 24 : 22,
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
                  fontSize: isActive ? 11 : 10,
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
