import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class ProfileView extends StatelessWidget {
  final VoidCallback onLogout;

  const ProfileView({
    super.key,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: const Color(0xFF0F172A),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 24),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 106,
                      height: 106,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFFCD34D)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.5), blurRadius: 20, spreadRadius: 2)],
                      ),
                    ),
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: const Color(0xFF0F172A),
                      child: CircleAvatar(
                        radius: 44,
                        backgroundColor: Colors.white70,
                        child: Text(
                          provider.fullName != null && provider.fullName!.isNotEmpty
                              ? provider.fullName!.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase()
                              : 'AG',
                          style: const TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFB45309)]),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.workspace_premium, color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text('RANK ${provider.rankName.toUpperCase()}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(provider.fullName ?? 'Anggota', style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text('Anggota ${provider.rankName} Koperasi', style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text('No. Anggota: KMP-DSKMJ-2026-${(provider.memberId ?? 1).toString().padLeft(4, '0')}', style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                if (provider.email != null) ...[
                  const SizedBox(height: 2),
                  Text(provider.email!, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                ],
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTopBadge(Icons.local_fire_department, '${provider.streak} Hari Streak', Colors.white, Colors.white12, iconColor: Colors.orange),
                    const SizedBox(width: 8),
                    _buildTopBadge(Icons.calendar_month, 'Aktif 2026', Colors.white, Colors.white12),
                  ],
                )
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  color: const Color(0xFF111827),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(color: Colors.white, padding: const EdgeInsets.all(6), child: const Icon(Icons.qr_code, color: Colors.black, size: 52)),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('QR Kartu Keanggotaan', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                              SizedBox(height: 4),
                              Text('Untuk transaksi, presensi RAT, dan verifikasi identitas', style: TextStyle(color: Colors.grey, fontSize: 9.5))
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text('Ranking', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF1C2533),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildRankItem(Icons.eco, 'Perunggu', Colors.greenAccent, provider.rankName == 'Perunggu'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.military_tech, 'Perak', Colors.amberAccent, provider.rankName == 'Perak'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.workspace_premium, 'Emas', const Color(0xFFF59E0B), provider.rankName == 'Emas'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.diamond, 'Platinum', Colors.lightBlue, provider.rankName == 'Platinum', opacity: provider.level >= 10 ? 1.0 : 0.5),
                              _buildRankDivider(),
                              _buildRankItem(Icons.grade, 'Legenda', Colors.redAccent, provider.rankName == 'Legenda', opacity: provider.level >= 15 ? 1.0 : 0.5),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: Colors.white10),
                        const SizedBox(height: 8),
                        const Text(
                          'Tingkatkan Ranking untuk limit pinjaman lebih tinggi + hadiah eksklusif!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 10, height: 1.4),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Penghargaan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                SizedBox(
                  height: 120,
                  child: provider.earnedBadges.isEmpty
                      ? const Center(
                          child: Text('Belum ada penghargaan', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        )
                      : ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: provider.earnedBadges.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 12),
                          itemBuilder: (context, i) {
                            final badge = provider.earnedBadges[i];
                            return _buildAchievementIcon(
                              badge['name'] ?? 'Badge',
                              badge['description'] ?? '',
                              Icons.emoji_events,
                            );
                          },
                        ),
                ),
                const SizedBox(height: 24),
                const Text('Dampak Personal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                  children: [
                    _buildImpactCard('Total Simpanan', 'Rp ${((provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela) / 1000000).toStringAsFixed(1)}Jt'),
                    _buildImpactCard('Misi Diselesaikan', '${provider.missions.where((m) => m.completed).length}'),
                    _buildImpactCard('Level Kamu', 'Level ${provider.level}'),
                    _buildImpactCard('Tingkat Kemenangan', '${provider.userWinRate}%'),
                  ],
                ),
                const SizedBox(height: 20),

                // Mutasi & Ledger Keuangan
                const Text('Mutasi & Ledger Keuangan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (provider.listSavings.isEmpty && provider.listLoans.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Text('Belum ada transaksi tercatat.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        else ...[
                          if (provider.listSavings.isNotEmpty) ...[
                            const Text('Simpanan & Penarikan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            const SizedBox(height: 8),
                            ...provider.listSavings.map((s) {
                              final bool isDeposit = s['type'] == 'deposit';
                              final int amount = s['amount'] ?? 0;
                              final String desc = s['description'] ?? 'Transaksi Simpanan';
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(desc, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                          Text(
                                            s['transactionDate'] != null ? s['transactionDate'].toString().split('T')[0] : '',
                                            style: const TextStyle(fontSize: 9, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${isDeposit ? "+" : "-"} Rp ${amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: isDeposit ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(height: 12),
                          ],
                          if (provider.listLoans.isNotEmpty) ...[
                            const Divider(height: 1),
                            const SizedBox(height: 12),
                            const Text('Status Pinjaman', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            const SizedBox(height: 8),
                            ...provider.listLoans.map((l) {
                              final int amount = l['amount'] ?? 0;
                              final String status = l['status'] ?? 'pending';
                              final Color statusColor = status == 'approved'
                                  ? const Color(0xFF3B82F6)
                                  : status == 'paid'
                                      ? const Color(0xFF16A34A)
                                      : const Color(0xFFF59E0B);
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Pinjaman Dana', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        const SizedBox(height: 4),
                                        Container(
                                          decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          child: Text(status.toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor)),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      'Rp ${amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text('Pengaturan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF718096),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Column(
                    children: [
                      _buildSettingsTile('Edit Profil'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Ganti PIN'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Notifikasi'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Bahasa'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Pusat Bantuan'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: onLogout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Keluar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTopBadge(IconData icon, String text, Color textCol, Color bgCol, {Color? iconColor}) {
    return Container(
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(20),
        border: bgCol == Colors.white12 ? Border.all(color: Colors.white10) : null,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor ?? textCol, size: 12),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(color: textCol, fontSize: 9, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildImpactCard(String label, String value) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9).withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(String title) {
    return ListTile(
      title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      trailing: const Icon(Icons.chevron_right, color: Colors.white70),
      onTap: () {},
    );
  }

  Widget _buildRankItem(IconData icon, String title, Color color, bool isActive, {double opacity = 1.0}) {
    return Opacity(
      opacity: opacity,
      child: Column(
        children: [
          Container(
            width: isActive ? 52 : 46,
            height: isActive ? 52 : 46,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(isActive ? 12 : 24),
              border: isActive ? Border.all(color: const Color(0xFFFACC15), width: 2) : Border.all(color: Colors.white10),
              boxShadow: isActive ? [BoxShadow(color: const Color(0xFFFACC15).withOpacity(0.3), blurRadius: 15)] : null,
            ),
            child: Icon(icon, color: isActive ? const Color(0xFFFBBF24) : color, size: isActive ? 28 : 22),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(
              fontSize: 8,
              color: isActive ? const Color(0xFFFACC15) : Colors.white60,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildRankDivider() {
    return Container(width: 24, height: 1.5, color: Colors.white10, margin: const EdgeInsets.symmetric(horizontal: 6));
  }

  Widget _buildAchievementIcon(String title, String desc, IconData icon, {double opacity = 1.0}) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: 128,
        decoration: BoxDecoration(color: const Color(0xFF718096), borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 36),
            const SizedBox(height: 8),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            Text(desc, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 8)),
          ],
        ),
      ),
    );
  }
}
