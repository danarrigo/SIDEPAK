import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/shop_item.dart';

class MisiView extends StatelessWidget {
  const MisiView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final double progress = (provider.points / 1500).clamp(0.0, 1.0);

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

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: const Color(0xFF131926),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      decoration: BoxDecoration(color: const Color(0xFFFCD34D), borderRadius: BorderRadius.circular(20)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Rank: ${provider.rankName}',
                        style: const TextStyle(color: Color(0xFF78350F), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Text(
                      '${provider.points} / 1.500 poin menuju Platinum',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: Container(
                        width: 180,
                        height: 6,
                        color: const Color(0xFF334155),
                        alignment: Alignment.centerLeft,
                        child: Container(
                          width: 180 * progress,
                          height: 6,
                          color: const Color(0xFFFCD34D),
                        ),
                      ),
                    )
                  ],
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('STREAK', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    const SizedBox(height: 4),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1C2533),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF475569)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.bolt, color: Colors.orange, size: 18),
                          const SizedBox(width: 4),
                          Text(
                            provider.streak.toString(),
                            style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )
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
                Transform.translate(
                  offset: const Offset(0, -26),
                  child: Card(
                    color: const Color(0xFF1C2533),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Streak Mingguan', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: provider.weeklyStreakDays.entries.map((entry) {
                              final day = entry.key;
                              final done = entry.value;
                              final dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                              final todayLabel = dayLabels[(DateTime.now().weekday - 1) % 7];
                              final bool isToday = day == todayLabel;

                              return Column(
                                children: [
                                  Container(
                                    width: 38,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: isToday
                                          ? const Color(0xFF84CC16)
                                          : done
                                              ? const Color(0xFF4D7C0F).withOpacity(0.5)
                                              : Colors.transparent,
                                      border: isToday
                                          ? Border.all(color: const Color(0xFF84CC16))
                                          : done
                                              ? Border.all(color: const Color(0xFF84CC16))
                                              : Border.all(color: const Color(0xFF475569), width: 2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: isToday
                                        ? const Icon(Icons.local_fire_department, color: Colors.white, size: 20)
                                        : done
                                            ? const Icon(Icons.check_circle, color: Colors.white, size: 18)
                                            : null,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(day, style: TextStyle(color: done || isToday ? Colors.white : Colors.grey, fontSize: 9)),
                                ],
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Pertahankan Streak! Bonus +50 poin di akhir minggu',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                _buildMissionSectionCard(context, 'Misi Harian', true),
                const SizedBox(height: 16),
                _buildMissionSectionCard(context, 'Misi Mingguan', false),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Toko Item', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                    Text('Saldo: ${provider.points} Poin', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                  ],
                ),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.72,
                  children: provider.shopItems.map((item) => _buildShopItemCard(context, item)).toList(),
                ),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMissionSectionCard(BuildContext context, String title, bool isDaily) {
    final provider = context.read<KoperasiProvider>();
    final list = provider.missions.where((m) => m.isDaily == isDaily).toList();
    final pointsAvailable = isDaily ? 100 : 380;

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

    return Card(
      color: Colors.white,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                Text('+ $pointsAvailable Poin Tersedia', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFACC15)))
              ],
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final m = list[index];
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => provider.toggleMission(m.id, showSnackBar),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: m.completed ? const Color(0xFF84CC16) : Colors.transparent,
                              border: Border.all(color: m.completed ? const Color(0xFF84CC16) : const Color(0xFFCBD5E1), width: 2),
                            ),
                            child: m.completed ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          m.title,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: m.completed ? Colors.grey : const Color(0xFF475569),
                            decoration: m.completed ? TextDecoration.lineThrough : null,
                          ),
                        ),
                      ],
                    ),
                    Text('+ ${m.points}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFACC15)))
                  ],
                );
              },
            )
          ],
        ),
      ),
    );
  }

  Widget _buildShopItemCard(BuildContext context, ShopItem item) {
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

    return Card(
      color: const Color(0xFF718096),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: item.bgGlow, blurRadius: 15)],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
              child: Icon(item.icon, color: item.iconColor, size: 24),
            ),
            const SizedBox(height: 8),
            Text(item.title, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Expanded(child: Text(item.description, textAlign: TextAlign.center, maxLines: 3, style: const TextStyle(color: Colors.white70, fontSize: 8.5))),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('⭐', style: TextStyle(fontSize: 10)),
                const SizedBox(width: 2),
                Text('${item.cost} poin', style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => provider.buyShopItem(item, showSnackBar),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  border: Border.all(color: Colors.white38),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                child: Text(
                  item.ownedCount > 0 ? 'Beli (Miliki: ${item.ownedCount}x)' : 'Beli',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
