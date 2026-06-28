import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/mission.dart';
import 'simpanan_view.dart';
import 'widgets/leaderboard_section.dart';

class HomeView extends StatelessWidget {
  final Function(int) onNavigate;

  const HomeView({
    super.key,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final int totalSimpanan = provider.totalSimpanan > 0
        ? provider.totalSimpanan
        : provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela;
    final double progress = (provider.points / provider.nextLevelPoints).clamp(0.0, 1.0);
    final missions = provider.missions.where((m) => m.isDaily).toList();

    void showSnackBar(String message) {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Halo, ${provider.fullName != null && provider.fullName!.isNotEmpty ? provider.fullName!.split(' ')[0] : 'Anggota'}!',
                            style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            provider.isMemberActive ? 'Anggota Aktif' : 'Anggota Nonaktif',
                            style: TextStyle(
                              color: provider.isMemberActive ? Colors.white : const Color(0xFFEF4444),
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Koperasi Merah Putih Desa Sukamaju',
                            style: TextStyle(color: Colors.white60, fontSize: 11),
                          ),
                        ],
                      ),
                      Container(
                        decoration: const BoxDecoration(color: Color(0x1AFFFFFF), shape: BoxShape.circle),
                        padding: const EdgeInsets.all(12),
                        child: const Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Icon(Icons.notifications, color: Colors.white, size: 24),
                            Positioned(top: 0, right: 0, child: CircleAvatar(radius: 4, backgroundColor: Colors.red))
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('🔥 ', style: TextStyle(fontSize: 12)),
                          Text(
                            '${provider.streak} hari Streak',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  if (!provider.isMemberActive) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Keanggotaan Nonaktif',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF991B1B)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  !provider.isPokokPaid
                                      ? 'Harap bayar Simpanan Pokok (Rp 100.000) agar status aktif.'
                                      : 'Harap bayar Simpanan Wajib Bulan Ini (Rp 50.000) agar status aktif.',
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF7F1D1D)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const SimpananView()),
                              );
                            },
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFFDC2626),
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text('BAYAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ),
                  ],
                  Transform.translate(
                    offset: const Offset(0, -32),
                    child: Card(
                      color: Colors.white,
                      surfaceTintColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      elevation: 4,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              color: Color(0xFF718096),
                              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                            child: const Text(
                              'TOTAL SIMPANAN',
                              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Rp ${totalSimpanan.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")},00',
                                  style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    _buildSavingsDetail('Pokok', provider.simpananPokok),
                                    _buildSavingsDetail('Wajib', provider.simpananWajib),
                                    _buildSavingsDetail('Sukarela', provider.simpananSukarela),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                OutlinedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => const SimpananView()),
                                    );
                                  },
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Colors.black26),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text('Mutasi Saldo', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                                      SizedBox(width: 6),
                                      Icon(Icons.arrow_forward, size: 14, color: Colors.grey),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Transform.translate(
                    offset: const Offset(0, -16),
                    child: Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF9C3),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: const Color(0xFFFDE047)),
                          ),
                          padding: const EdgeInsets.all(20),
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'SALDO POIN',
                                    style: TextStyle(color: Color(0xFF854D0E), fontSize: 14, fontWeight: FontWeight.w900),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(color: const Color(0xFFFCD34D), borderRadius: BorderRadius.circular(20)),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                    child: Text(
                                      provider.rankName,
                                      style: const TextStyle(color: Color(0xFF854D0E), fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  const Icon(Icons.stars, color: Color(0xFFFACC15), size: 48),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.baseline,
                                        textBaseline: TextBaseline.alphabetic,
                                        children: [
                                          Text(
                                            provider.points.toString(),
                                            style: const TextStyle(color: Color(0xFFFACC15), fontSize: 32, fontWeight: FontWeight.w900),
                                          ),
                                          const SizedBox(width: 4),
                                          const Text(
                                            'Poin',
                                            style: TextStyle(color: Color(0xFFFACC15), fontSize: 18, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                      Text(
                                        'Anggota ${provider.rankName}',
                                        style: const TextStyle(color: Color(0xFF854D0E), fontSize: 10, fontWeight: FontWeight.w800),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${provider.nextLevelPoints - provider.points > 0 ? "${provider.nextLevelPoints - provider.points} poin lagi menuju ${provider.nextRankName}" : "${provider.nextRankName} Tercapai!"}',
                                        style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        '${provider.points} / ${provider.nextLevelPoints}',
                                        style: const TextStyle(fontSize: 8, color: Colors.black87, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: progress,
                                      minHeight: 6,
                                      backgroundColor: Colors.white.withOpacity(0.5),
                                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFACC15)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Card(
                          color: Colors.white,
                          surfaceTintColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          elevation: 1,
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Misi Hari Ini',
                                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                    ),
                                    Text(
                                      'Klaim hadiah',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: missions.length > 4 ? 4 : missions.length,
                                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                                  itemBuilder: (context, index) {
                                    final m = missions[index];
                                    return Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                m.title,
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: m.isCompleted ? Colors.grey : const Color(0xFF64748B),
                                                  decoration: m.isCompleted ? TextDecoration.lineThrough : null,
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                'Progres: ${m.progress} / ${m.targetCount}  •  +${m.points} XP',
                                                style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        _buildMissionAction(
                                          context,
                                          provider,
                                          m,
                                          showSnackBar,
                                        ),
                                      ],
                                    );
                                  },
                                ),
                                const SizedBox(height: 12),
                                GestureDetector(
                                  onTap: () => onNavigate(1),
                                  child: const Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      Text('Kelola Misi Selengkapnya', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.bold)),
                                      SizedBox(width: 4),
                                      Icon(Icons.arrow_forward, size: 12, color: Color(0xFFFBBF24)),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF718096),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                'Koperasi Hari ini',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                              ),
                              const SizedBox(height: 16),
                              GridView.count(
                                crossAxisCount: 2,
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 1.5,
                                children: [
                                  _buildCoopStat(Icons.swap_horiz, '${provider.kopTransaksi}', 'Transaksi'),
                                  _buildCoopStat(Icons.attach_money, provider.kopOmzet > 0 ? 'Rp ${provider.kopOmzet}Jt' : '-', 'Omzet Harian'),
                                  _buildCoopStat(Icons.groups, '${provider.kopAnggotaBaru}', 'Anggota Baru'),
                                  _buildCoopStat(Icons.storefront, '${provider.kopUmkm}', 'UMKM Aktif'),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Leaderboard — DB-backed (Phase 3: multi-scope)
                        LeaderboardSection(provider: provider),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMissionAction(
    BuildContext context,
    KoperasiProvider provider,
    Mission m,
    void Function(String) showSnackBar,
  ) {
    if (m.isCompleted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(20)),
        child: const Text('SELESAI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
      );
    }
    if (m.isClaimable) {
      return GestureDetector(
        onTap: () async {
          final msg = await provider.claimMission(m.id, m.points);
          showSnackBar(msg);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(color: const Color(0xFFFACC15), borderRadius: BorderRadius.circular(20)),
          child: const Text('KLAIM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ),
      );
    }
    return Text('+${m.points} XP', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24)));
  }

  Widget _buildSavingsDetail(String label, int val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 2),
        Text('Rp ${(val / 1000).toStringAsFixed(0)}rb', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)))
      ],
    );
  }

  Widget _buildCoopStat(IconData icon, String val, String title) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9).withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.grey, size: 20),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
          Text(title, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }
}