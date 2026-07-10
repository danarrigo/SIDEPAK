import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/mission.dart';

class MisiView extends StatelessWidget {
  const MisiView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final double progress =
        (provider.points / provider.nextLevelPoints).clamp(0.0, 1.0);

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: const Color(0xFF131926),
              padding: const EdgeInsets.only(
                  top: 60, left: 24, right: 24, bottom: 40),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        decoration: const BoxDecoration(
                            color: Color(0xFFFCD34D),
                            borderRadius:
                                BorderRadius.all(Radius.circular(20))),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          'Rank: ${provider.rankName}',
                          style: const TextStyle(
                              color: Color(0xFF78350F),
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text(
                        '${provider.points} / ${provider.nextLevelPoints} poin menuju ${provider.nextRankName}',
                        style: const TextStyle(
                            color: Color(0xFF94A3B8), fontSize: 10),
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
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900),
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
                          const Text('Streak Mingguan',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children:
                                provider.weeklyStreakDays.entries.map((entry) {
                              final day = entry.key;
                              final done = entry.value;
                              final dayLabels = [
                                'Sen',
                                'Sel',
                                'Rab',
                                'Kam',
                                'Jum',
                                'Sab',
                                'Min'
                              ];
                              final todayLabel =
                                  dayLabels[(DateTime.now().weekday - 1) % 7];
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
                                              ? const Color(0xFF4D7C0F)
                                                  .withOpacity(0.5)
                                              : Colors.transparent,
                                      border: isToday
                                          ? Border.all(
                                              color: const Color(0xFF84CC16))
                                          : done
                                              ? Border.all(
                                                  color:
                                                      const Color(0xFF84CC16))
                                              : Border.all(
                                                  color:
                                                      const Color(0xFF475569),
                                                  width: 2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: isToday
                                        ? const Icon(
                                            Icons.local_fire_department,
                                            color: Colors.white,
                                            size: 20)
                                        : done
                                            ? const Icon(Icons.check_circle,
                                                color: Colors.white, size: 18)
                                            : null,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(day,
                                      style: TextStyle(
                                          color: done || isToday
                                              ? Colors.white
                                              : Colors.grey,
                                          fontSize: 9)),
                                ],
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Pertahankan Streak! Bonus +50 poin di akhir minggu',
                            style: TextStyle(
                                color: Color(0xFF94A3B8), fontSize: 10),
                          )
                        ],
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Misi Harian',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155))),
                      _buildResetCountdown(isDaily: true),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildMissionSectionCard(context, true),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Misi Mingguan',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155))),
                      _buildResetCountdown(isDaily: false),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildMissionSectionCard(context, false),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Peti Harta Mingguan',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155))),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildChestMilestoneCard(context),
                  const SizedBox(height: 20),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildChestMilestoneCard(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final completedMissions =
        provider.missions.where((m) => m.isCompleted).length;
    final chestMilestones = [6, 12, 18, 24, 30];
    final progress = (completedMissions / 30).clamp(0.0, 1.0);

    return Card(
      color: Colors.white,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Selesaikan misi untuk membuka hingga 5 peti harta!\n($completedMissions misi selesai)',
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                  fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 24),
            Stack(
              alignment: Alignment.center,
              children: [
                // Progress Bar Background
                Positioned(
                  left: 16,
                  right: 16,
                  top: 14,
                  child: Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                // Progress Bar Fill
                Positioned(
                  left: 16,
                  right: 16,
                  top: 14,
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: progress,
                    child: Container(
                      height: 6,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                // Chests
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: chestMilestones.asMap().entries.map((entry) {
                    final index = entry.key;
                    final target = entry.value;
                    final isUnlocked = completedMissions >= target;
                    final isClaimed = provider.claimedChests.contains(index);

                    return GestureDetector(
                      onTap: () async {
                        if (isUnlocked && !isClaimed) {
                          final msg = await provider.claimWeeklyChest(index);
                          ScaffoldMessenger.of(context).clearSnackBars();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                                content: Text(msg,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold))),
                          );
                        } else if (isClaimed) {
                          ScaffoldMessenger.of(context).clearSnackBars();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Peti harta ini sudah diklaim!',
                                    style: TextStyle(
                                        fontWeight: FontWeight.bold))),
                          );
                        } else {
                          ScaffoldMessenger.of(context).clearSnackBars();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'Selesaikan lebih banyak misi untuk membuka peti ini.',
                                    style: TextStyle(
                                        fontWeight: FontWeight.bold))),
                          );
                        }
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: isClaimed
                                  ? const Color(0xFFF1F5F9)
                                  : isUnlocked
                                      ? const Color(0xFFFEF3C7)
                                      : Colors.white,
                              border: Border.all(
                                color: isClaimed
                                    ? const Color(0xFF94A3B8)
                                    : isUnlocked
                                        ? const Color(0xFFF59E0B)
                                        : const Color(0xFFE2E8F0),
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isClaimed
                                  ? Icons.check
                                  : (isUnlocked ? Icons.redeem : Icons.lock),
                              size: 18,
                              color: isClaimed
                                  ? const Color(0xFF94A3B8)
                                  : isUnlocked
                                      ? const Color(0xFFF59E0B)
                                      : const Color(0xFFCBD5E1),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '$target',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isClaimed
                                  ? const Color(0xFF94A3B8)
                                  : isUnlocked
                                      ? const Color(0xFFD97706)
                                      : const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMissionSectionCard(BuildContext context, bool isDaily) {
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
            if (list.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('Belum ada misi tersedia.',
                    style: TextStyle(color: Colors.grey, fontSize: 12)),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: list.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
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

  Widget _buildResetCountdown({required bool isDaily}) {
    final now = DateTime.now();
    String label;
    if (isDaily) {
      final midnight =
          DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
      final diff = midnight.difference(now);
      final hours = diff.inHours;
      final minutes = diff.inMinutes % 60;
      label = 'Reset ${hours}j ${minutes}m';
    } else {
      // Weekly reset: count down to next Monday 00:00
      final daysUntilMonday = (8 - now.weekday) % 7;
      final nextMonday = DateTime(now.year, now.month, now.day)
          .add(Duration(days: daysUntilMonday == 0 ? 7 : daysUntilMonday));
      final diff = nextMonday.difference(now);
      final days = diff.inDays;
      final hours = diff.inHours % 24;
      final minutes = diff.inMinutes % 60;
      label = 'Reset ${days}h ${hours}j ${minutes}m';
    }
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
            label,
            style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: Color(0xFFB45309)),
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
          content: Text(message,
              style: const TextStyle(fontWeight: FontWeight.bold)),
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
                  color: mission.isCompleted
                      ? Colors.grey
                      : const Color(0xFF475569),
                  decoration:
                      mission.isCompleted ? TextDecoration.lineThrough : null,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Progres: ${mission.progress} / ${mission.targetCount}',
                style: const TextStyle(
                    fontSize: 10,
                    color: Colors.grey,
                    fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        if (mission.isCompleted)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(20)),
            child: const Text('SELESAI',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey)),
          )
        else if (mission.isClaimable)
          GestureDetector(
            onTap: () async {
              final msg =
                  await provider.claimMission(mission.id, mission.points);
              showSnackBar(msg);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                  color: const Color(0xFFFACC15),
                  borderRadius: BorderRadius.circular(20)),
              child: const Text('KLAIM',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A))),
            ),
          )
        else
          Text('+${mission.points} XP',
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFACC15))),
      ],
    );
  }
}
