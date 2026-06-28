import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final int p1 = (provider.activeBattle != null
        ? (provider.activeBattle!['challengerId'] == provider.memberId
            ? provider.activeBattle!['challengerPoints']
            : provider.activeBattle!['opponentPoints'])
        : 0) as int;
    final int p2 = (provider.activeBattle != null
        ? (provider.activeBattle!['challengerId'] == provider.memberId
            ? provider.activeBattle!['opponentPoints']
            : provider.activeBattle!['challengerPoints'])
        : 0) as int;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: const Color(0xFF121926),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 30),
            child: const Row(
              children: [
                Icon(Icons.bolt, color: Colors.white, size: 28),
                SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Arena Bertanding', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                    Text('Bertanding Mingguan – reset setiap senin 00:00', style: TextStyle(color: Colors.white60, fontSize: 10))
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
                  color: const Color(0xFF6D7D91),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Battle Minggu Ini', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildPlayerCol(
                              provider.fullName?.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase() ?? 'AG',
                              '${provider.fullName?.split(' ')[0] ?? 'Kamu'} (Kamu)',
                              '$p1 Poin',
                            ),
                            const Text('VS', style: TextStyle(color: Colors.white38, fontSize: 20, fontStyle: FontStyle.italic, fontWeight: FontWeight.w900)),
                            _buildPlayerCol(
                              provider.activeBattle?['opponent']?['namaLengkap']?.toString().trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase() ?? '??',
                              provider.activeBattle?['opponent']?['namaLengkap']?.toString().split(' ')[0] ?? 'Menunggu Lawan',
                              '$p2 Poin',
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Container(
                          decoration: BoxDecoration(color: const Color(0xFF5A6B7D), borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _buildComparisonRow('Misi Diselesaikan', '${provider.missions.where((m) => m.isCompleted).length}', '-'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow(
                                'Total Tabungan',
                                'Rp ${(provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela) >= 1000000 ? '${((provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela) / 1000000).toStringAsFixed(1)}Jt' : '${provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela}'}',
                                '-',
                              ),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Streak Aktif', '${provider.streak} hari', '-'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Level', 'Level ${provider.level}', '-'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          provider.activeBattleEndDate != null
                              ? 'Battle berakhir: ${provider.activeBattleEndDate}'
                              : 'Belum ada battle aktif',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Riwayat Bertanding', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 12),
                provider.historyList.isEmpty
                    ? Container(
                        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFCBD5E1), width: 2),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: const Text(
                          'Belum ada riwayat pertandingan.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      )
                    : Container(
                        decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1), width: 2), borderRadius: BorderRadius.circular(24)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: provider.historyList.length,
                          separatorBuilder: (c, i) => const Divider(color: Colors.grey, height: 16),
                          itemBuilder: (context, index) {
                            final item = provider.historyList[index];
                            final bool isWin = item.result == 'Menang';
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 64,
                                      decoration: BoxDecoration(
                                        color: isWin ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: isWin ? const Color(0xFF86EFAC) : const Color(0xFFFECACA)),
                                      ),
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      alignment: Alignment.center,
                                      child: Text(
                                        item.result,
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isWin ? const Color(0xFF16A34A) : const Color(0xFFEF4444)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('vs ${item.opponent}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                                        if (item.date != null)
                                          Text(item.date!, style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                      ],
                                    ),
                                  ],
                                ),
                                Text('${item.points} poin', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.orange)),
                              ],
                            );
                          },
                        ),
                      ),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPlayerCol(String initials, String name, String subText) {
    return Column(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: Colors.white24,
          child: CircleAvatar(
            radius: 36,
            backgroundColor: Colors.grey.shade300,
            child: Text(initials, style: TextStyle(color: Colors.grey.shade700, fontSize: 20, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 8),
        Text(name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        Text(subText, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildComparisonRow(String metric, String userVal, String oppVal) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(flex: 2, child: Text(metric, style: const TextStyle(color: Colors.white, fontSize: 11))),
        Expanded(child: Text(userVal, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFF83A4C), fontSize: 11, fontWeight: FontWeight.bold))),
        Expanded(child: Text(oppVal, textAlign: TextAlign.right, style: const TextStyle(color: Color(0xFF39C2F6), fontSize: 11, fontWeight: FontWeight.bold))),
      ],
    );
  }
}
