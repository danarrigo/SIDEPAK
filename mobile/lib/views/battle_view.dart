import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    // Mock data based on new Guild War design
    final myCoopName = "Koperasi Suka Maju";
    final rivalCoopName = "Koperasi Jaya Abadi";
    final myCoopScore = 12; // Wins
    final rivalCoopScore = 9; // Wins
    final myCoopRank = 1;
    final totalXp = 1500;

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D8ABC), Color(0xFF22C55E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              padding: const EdgeInsets.only(
                  top: 60, left: 24, right: 24, bottom: 30),
              child: const Row(
                children: [
                  Icon(Icons.emoji_events, color: Colors.white, size: 28),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Guild Wars',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold)),
                      Text('Musim Tanam Raya',
                          style: TextStyle(color: Colors.white70, fontSize: 12))
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
                  // Guild War Match Card
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF0D8ABC).withOpacity(0.3)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0D8ABC).withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text('MINGGU INI VS RIVAL',
                            style: TextStyle(
                                color: Color(0xFF1E293B),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2)),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                children: [
                                  const Text('ANDA',
                                      style: TextStyle(
                                          color: Color(0xFF0D8ABC),
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold)),
                                  Text('$myCoopScore',
                                      style: const TextStyle(
                                          color: Color(0xFF0D8ABC),
                                          fontSize: 36,
                                          fontWeight: FontWeight.w900)),
                                ],
                              ),
                            ),
                            const Text('VS',
                                style: TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontSize: 20,
                                    fontStyle: FontStyle.italic,
                                    fontWeight: FontWeight.w900)),
                            Expanded(
                              child: Column(
                                children: [
                                  const Text('RIVAL',
                                      style: TextStyle(
                                          color: Colors.redAccent,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold)),
                                  Text('$rivalCoopScore',
                                      style: const TextStyle(
                                          color: Colors.redAccent,
                                          fontSize: 36,
                                          fontWeight: FontWeight.w900)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(rivalCoopName,
                            style: const TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 12,
                                fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 1v1 Battle Button
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Mencari lawan dari koperasi rival...')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D8ABC),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.sports_kabaddi, color: Colors.white),
                        SizedBox(width: 8),
                        Text('Cari Lawan 1v1',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Leaderboard
                  const Text('Klasemen Liga (Top 50)',
                      style: TextStyle(
                          color: Color(0xFF1E293B),
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: 5,
                      separatorBuilder: (context, index) =>
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      itemBuilder: (context, index) {
                        final isMine = index == 0;
                        return Container(
                          color: isMine ? const Color(0xFF0D8ABC).withOpacity(0.05) : null,
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 24,
                                child: Text(
                                  index == 0 ? '🥇' : index == 1 ? '🥈' : index == 2 ? '🥉' : '${index + 1}',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      index == 0 ? myCoopName : 'Koperasi Lain ${index + 1}',
                                      style: TextStyle(
                                        color: isMine ? const Color(0xFF0D8ABC) : const Color(0xFF1E293B),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    if (isMine)
                                      const Text(
                                        'Koperasi Anda',
                                        style: TextStyle(color: Color(0xFF0D8ABC), fontSize: 10),
                                      ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${12 - index} W',
                                    style: const TextStyle(
                                      color: Color(0xFF0D8ABC),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    '${1500 - (index * 100)} XP',
                                    style: const TextStyle(
                                      color: Color(0xFF64748B),
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
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
}
