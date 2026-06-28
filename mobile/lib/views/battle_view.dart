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

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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
                  if (provider.activeBattle == null) _buildEmptyBattleCard(provider),
                  if (provider.activeBattle != null)
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
                                  provider.fullName != null && provider.fullName!.isNotEmpty
                                      ? provider.fullName!.substring(0, 1).toUpperCase()
                                      : 'A',
                                  provider.fullName != null && provider.fullName!.isNotEmpty
                                      ? provider.fullName!.split(' ')[0]
                                      : 'Anda',
                                  '$p1 XP',
                                ),
                                const Text('VS', style: TextStyle(color: Colors.amber, fontSize: 32, fontWeight: FontWeight.bold, fontStyle: FontStyle.italic)),
                                _buildPlayerCol(
                                  provider.activeBattle!['challengerId'] == provider.memberId
                                      ? (provider.activeBattle!['opponent']?['namaLengkap']?.toString().substring(0, 1).toUpperCase() ?? 'L')
                                      : (provider.activeBattle!['challenger']?['namaLengkap']?.toString().substring(0, 1).toUpperCase() ?? 'L'),
                                  provider.activeBattle!['challengerId'] == provider.memberId
                                      ? (provider.activeBattle!['opponent']?['namaLengkap']?.toString().split(' ')[0] ?? 'Lawan')
                                      : (provider.activeBattle!['challenger']?['namaLengkap']?.toString().split(' ')[0] ?? 'Lawan'),
                                  '$p2 XP',
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Container(
                              decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(16)),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              child: Column(
                                children: [
                                  _buildComparisonRow('XP Mingguan', '$p1', '$p2'),
                                  const Divider(color: Colors.white30, height: 16),
                                  _buildComparisonRow('Streak Belajar', '${provider.streak} Hari', provider.activeBattle != null ? '${provider.activeBattle!['opponentStreak'] ?? 0} Hari' : '0 Hari'),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              provider.activeBattleEndDate != null
                                  ? 'Berakhir pada: ${DateTime.tryParse(provider.activeBattleEndDate!)?.toLocal().toString().split(' ')[0] ?? provider.activeBattleEndDate}'
                                  : 'Berakhir: Minggu 23:59',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (provider.activeBattle != null) const SizedBox(height: 24),
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

  Widget _buildEmptyBattleCard(KoperasiProvider provider) {
    return _EmptyBattleCard(provider: provider);
  }
}

class _EmptyBattleCard extends StatefulWidget {
  final KoperasiProvider provider;
  const _EmptyBattleCard({required this.provider});

  @override
  State<_EmptyBattleCard> createState() => _EmptyBattleCardState();
}

class _EmptyBattleCardState extends State<_EmptyBattleCard> {
  bool _busy = false;

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF6D7D91),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Belum Ada Pertandingan',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'Tantang anggota koperasi lain dan buktikan kehebatanmu!',
              style: TextStyle(color: Colors.white70, fontSize: 11),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            const Icon(Icons.bolt, color: Color(0xFFFACC15), size: 64),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _busy
                  ? null
                  : () async {
                      setState(() => _busy = true);
                      final msg = await widget.provider.matchmakeBattle();
                      if (!mounted) return;
                      setState(() => _busy = false);
                      final isErr = !msg.toLowerCase().contains('ditemukan') &&
                          !msg.toLowerCase().contains('berhasil');
                      _showSnack(msg, isError: isErr);
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFACC15),
                foregroundColor: const Color(0xFF0F172A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              icon: _busy
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(color: Color(0xFF0F172A), strokeWidth: 2),
                    )
                  : const Icon(Icons.flash_on, size: 18),
              label: const Text(
                'CARI LAWAN SEKARANG',
                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
