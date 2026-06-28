import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/shop_item.dart';
import '../models/mission.dart';

class MisiView extends StatelessWidget {
  const MisiView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final double progress = (provider.points / provider.nextLevelPoints).clamp(0.0, 1.0);

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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
                        decoration: const BoxDecoration(color: Color(0xFFFCD34D), borderRadius: BorderRadius.all(Radius.circular(20))),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          'Rank: ${provider.rankName}',
                          style: const TextStyle(color: Color(0xFF78350F), fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text(
                        '${provider.points} / ${provider.nextLevelPoints} poin menuju ${provider.nextRankName}',
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
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'LEVEL',
                        style: TextStyle(color: Colors.white60, fontSize: 8),
                      ),
                      Text(
                        '${provider.level}',
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                      ),
                    ],
                  )
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  Transform.translate(
                    offset: const Offset(0, -30),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFF1E293B),
                        borderRadius: BorderRadius.all(Radius.circular(24)),
                      ),
                      padding: const EdgeInsets.all(20),
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Misi Harian', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                      _buildResetCountdown(),
                    ],
                  ),
                  const SizedBox(height: 8),
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
                  provider.shopItems.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Text('Belum ada item di toko.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                        )
                      : GridView.count(
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
      ),
    );
  }

  Widget _buildMissionSectionCard(BuildContext context, String title, bool isDaily) {
    final provider = context.read<KoperasiProvider>();
    final list = provider.missions.where((m) => m.isDaily == isDaily).toList();

    return Card(
      color: Colors.white,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
            const SizedBox(height: 16),
            if (list.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('Belum ada misi tersedia.', style: TextStyle(color: Colors.grey, fontSize: 12)),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: list.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final m = list[index];
                  return _MissionRow(mission: m);
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
              onTap: () async {
                final msg = await provider.buyShopItem(item);
                showSnackBar(msg);
              },
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  border: Border.all(color: Colors.white38),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                child: const Text(
                  'Beli',
                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResetCountdown() {
    final now = DateTime.now();
    final midnight = DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final diff = midnight.difference(now);
    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFFACC15).withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.refresh, size: 10, color: Color(0xFFB45309)),
          const SizedBox(width: 4),
          Text(
            'Reset ${hours}j ${minutes}m',
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
          ),
        ],
      ),
    );
  }
}

class _MissionRow extends StatelessWidget {
  final Mission mission;
  const _MissionRow({required this.mission});

  @override
  Widget build(BuildContext context) {
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

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                mission.title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: mission.isCompleted ? Colors.grey : const Color(0xFF475569),
                  decoration: mission.isCompleted ? TextDecoration.lineThrough : null,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Progres: ${mission.progress} / ${mission.targetCount}',
                style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        if (mission.isCompleted)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(20)),
            child: const Text('SELESAI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
          )
        else if (mission.isClaimable)
          GestureDetector(
            onTap: () async {
              final msg = await provider.claimMission(mission.id, mission.points);
              showSnackBar(msg);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFFACC15), borderRadius: BorderRadius.circular(20)),
              child: const Text('KLAIM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            ),
          )
        else
          Text('+${mission.points} XP', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFACC15))),
      ],
    );
  }
}