import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    // Using mock data since we don't have league actions synced to Flutter yet.
    // In a full implementation, we'd fetch this from the backend via KoperasiProvider.
    final myCoopScore = 1500;
    final myCoopRank = 3;

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: const Color(0xFF121926),
              padding: const EdgeInsets.only(
                  top: 60, left: 24, right: 24, bottom: 30),
              child: const Row(
                children: [
                  Icon(Icons.emoji_events, color: Colors.white, size: 28),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Liga Koperasi',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold)),
                      Text('Musim Tanam Raya',
                          style: TextStyle(color: Colors.white60, fontSize: 12))
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
                    color: const Color(0xFF0D8ABC).withOpacity(0.1),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                            color: const Color(0xFF0D8ABC).withOpacity(0.3))),
                    elevation: 0,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Status Koperasi Anda',
                                  style: TextStyle(
                                      color: Color(0xFF0D8ABC),
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold)),
                              Text('Peringkat #$myCoopRank',
                                  style: const TextStyle(
                                      color: Color(0xFF94A3B8), fontSize: 12)),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('$myCoopScore',
                                  style: const TextStyle(
                                      color: Color(0xFF0D8ABC),
                                      fontSize: 24,
                                      fontWeight: FontWeight.w900)),
                              const Text('TOTAL XP',
                                  style: TextStyle(
                                      color: Color(0xFF94A3B8),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Top Koperasi Nasional',
                      style: TextStyle(
                          color: Color(0xFF1E293B),
                          fontSize: 16,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildLeaderboardRow('Koperasi Makmur Jaya', 3450, 1, false),
                  _buildLeaderboardRow('Koperasi Sejahtera', 2100, 2, false),
                  _buildLeaderboardRow('Koperasi Anda', 1500, 3, true),
                  _buildLeaderboardRow('Koperasi Bina Warga', 1240, 4, false),
                  _buildLeaderboardRow('Koperasi Desa Hijau', 980, 5, false),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboardRow(String name, int score, int rank, bool isMine) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color:
            isMine ? const Color(0xFF0D8ABC).withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: isMine
                ? const Color(0xFF0D8ABC).withOpacity(0.3)
                : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 32,
            child: Text(
              rank == 1
                  ? '🥇'
                  : rank == 2
                      ? '🥈'
                      : rank == 3
                          ? '🥉'
                          : '$rank',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: rank > 3 ? const Color(0xFF94A3B8) : null),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isMine
                            ? const Color(0xFF0D8ABC)
                            : const Color(0xFF1E293B))),
                if (isMine)
                  const Text('Koperasi Anda',
                      style: TextStyle(fontSize: 10, color: Color(0xFF0D8ABC))),
              ],
            ),
          ),
          Text(
            '$score XP',
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: Color(0xFFF59E0B)),
          )
        ],
      ),
    );
  }
}
