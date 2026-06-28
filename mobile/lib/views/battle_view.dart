import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/shop_item.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  void _showUseItemSheet(BuildContext context) {
    final provider = context.read<KoperasiProvider>();

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

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF131926),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Gunakan Item Booster',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Pilih item dari inventori Anda untuk meningkatkan win rate.',
                style: TextStyle(color: Colors.white60, fontSize: 11),
              ),
              const SizedBox(height: 16),
              ListView.separated(
                shrinkWrap: true,
                itemCount: provider.shopItems.length,
                separatorBuilder: (c, idx) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = provider.shopItems[index];
                  final bool hasStock = item.ownedCount > 0;
                  return Opacity(
                    opacity: hasStock ? 1.0 : 0.4,
                    child: ListTile(
                      tileColor: const Color(0xFF1C2533),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      leading: Icon(item.icon, color: item.iconColor),
                      title: Text(item.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text(item.description, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                      trailing: Text('(${item.ownedCount}x)', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      onTap: hasStock
                          ? () {
                              Navigator.pop(context);
                              provider.useItemInBattle(item, showSnackBar);
                            }
                          : null,
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final int p1 = provider.activeBattle != null ? (provider.activeBattle!['challengerPoints'] ?? 8200) : 8200;
    final int p2 = provider.activeBattle != null ? (provider.activeBattle!['opponentPoints'] ?? 7500) : 7500;

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
                          '${p1} Poin',
                          Colors.grey,
                        ),
                            const Text('VS', style: TextStyle(color: Colors.white38, fontSize: 20, fontStyle: FontStyle.italic, fontWeight: FontWeight.w900)),
                        _buildPlayerCol(
                          provider.activeBattle?['opponent']?['namaLengkap']?.toString().trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase() ?? '??',
                          provider.activeBattle?['opponent']?['namaLengkap']?.toString().split(' ')[0] ?? 'Lawan',
                          '${p2} Poin',
                          Colors.grey,
                        ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Kamu ${provider.userWinRate}%', style: const TextStyle(color: Color(0xFFF83A4C), fontSize: 10, fontWeight: FontWeight.bold)),
                                Text('${100 - provider.userWinRate}% Lawan', style: const TextStyle(color: Color(0xFF39C2F6), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Row(
                                children: [
                                  Expanded(flex: provider.userWinRate, child: Container(height: 10, color: const Color(0xFFF83A4C))),
                                  Expanded(flex: 100 - provider.userWinRate, child: Container(height: 10, color: const Color(0xFF39C2F6)))
                                ],
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 20),
                        Container(
                          decoration: BoxDecoration(color: const Color(0xFF5A6B7D), borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                            _buildComparisonRow('Transaksi Minggu Ini', '${p1 ~/ 1000}', '${p2 ~/ 1000}'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Misi Diselesaikan', '${provider.missions.where((m) => m.completed).length}', '-'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Total Tabungan', 'Rp ${(provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela) >= 1000000 ? ((provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela) / 1000000).toStringAsFixed(1) + 'Jt' : (provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela).toString()}', '-'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Streak Aktif', '${provider.streak} hari', '-'),
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
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _showUseItemSheet(context),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: const Text('Pakai Item', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {},
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: const Text('Detail Bertanding', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            )
                          ],
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Riwayat Bertanding', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 12),
                Container(
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
                              Text('vs ${item.opponent}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                            ],
                          ),
                          Text('+ ${item.points}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.orange)),
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

  Widget _buildPlayerCol(String initials, String name, String subText, Color avatarColor) {
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
