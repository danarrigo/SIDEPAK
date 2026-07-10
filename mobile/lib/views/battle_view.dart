import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import '../models/history_item.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    final activeBattle = provider.activeBattle;
    final myStats = provider.myStats ?? {
      'missionsCompleted': 0, 'totalSavings': 0, 'savingsPts': 0, 'activeStreak': 0,
      'eventsJoined': 0, 'shopPurchases': 0, 'marketplaceActivity': 0, 'loansCount': 0, 'battlesWon': 0
    };
    final opStats = provider.opStats ?? {
      'missionsCompleted': 0, 'totalSavings': 0, 'savingsPts': 0, 'activeStreak': 0,
      'eventsJoined': 0, 'shopPurchases': 0, 'marketplaceActivity': 0, 'loansCount': 0, 'battlesWon': 0
    };
    final historyList = provider.historyList;
    final memberId = provider.memberId;
    final myName = provider.fullName?.split(' ')[0] ?? "Anda";

    int p1 = 0;
    int p2 = 0;
    String opponentName = 'Menunggu Lawan';
    if (activeBattle != null) {
      final challengerId = activeBattle['challengerId'];
      if (challengerId == memberId) {
        p1 = (activeBattle['challengerPoints'] as num?)?.toInt() ?? 0;
        p2 = (activeBattle['opponentPoints'] as num?)?.toInt() ?? 0;
      } else {
        p1 = (activeBattle['opponentPoints'] as num?)?.toInt() ?? 0;
        p2 = (activeBattle['challengerPoints'] as num?)?.toInt() ?? 0;
      }
      final op = activeBattle['opponent'];
      if (op != null && op['namaLengkap'] != null) {
        opponentName = (op['namaLengkap'] as String).split(' ')[0];
      }
    }
    double p1Pct = (p1 / 10000).clamp(0.0, 1.0);
    double p2Pct = (p2 / 10000).clamp(0.0, 1.0);

    final statRows = [
      {'label': 'Misi Harian', 'p1': myStats['missionsCompleted'] ?? 0, 'p2': opStats['missionsCompleted'] ?? 0},
      {'label': 'Penyetoran Tabungan', 'p1': myStats['savingsPts'] ?? 0, 'p2': opStats['savingsPts'] ?? 0},
      {'label': 'Konsistensi Login (Streak)', 'p1': myStats['activeStreak'] ?? 0, 'p2': opStats['activeStreak'] ?? 0},
      {'label': 'Belanja di Koperasi', 'p1': myStats['shopPurchases'] ?? 0, 'p2': opStats['shopPurchases'] ?? 0},
      {'label': 'Aktivitas Marketplace', 'p1': myStats['marketplaceActivity'] ?? 0, 'p2': opStats['marketplaceActivity'] ?? 0},
      {'label': 'Partisipasi Acara', 'p1': myStats['eventsJoined'] ?? 0, 'p2': opStats['eventsJoined'] ?? 0},
      {'label': 'Peminjaman Dana', 'p1': myStats['loansCount'] ?? 0, 'p2': opStats['loansCount'] ?? 0},
      {'label': 'Kemenangan Battle', 'p1': myStats['battlesWon'] ?? 0, 'p2': opStats['battlesWon'] ?? 0},
    ];
    final filteredStats = statRows.where((row) => (row['p1'] as int) > 0 || (row['p2'] as int) > 0).toList();

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
                  Icon(Icons.sports_kabaddi, color: Colors.white, size: 28),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Arena 1v1',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold)),
                      Text('Pertandingan Minggu Ini',
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
                  // Anda Card
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: const Border(left: BorderSide(color: Color(0xFF0D8ABC), width: 4)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0D8ABC).withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF0D8ABC), width: 4),
                          ),
                          child: CircleAvatar(
                            radius: 40,
                            backgroundColor: const Color(0xFFF1F5F9),
                            child: Text(
                              myName.isNotEmpty ? myName[0].toUpperCase() : 'A',
                              style: const TextStyle(color: Color(0xFF0D8ABC), fontSize: 32, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(myName,
                            style: const TextStyle(
                                color: Color(0xFF1E293B),
                                fontSize: 24,
                                fontWeight: FontWeight.bold)),
                        const Text('Anda',
                            style: TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Skor Saat Ini',
                                style: TextStyle(
                                    color: Color(0xFF64748B),
                                    fontSize: 14)),
                            Text('$p1',
                                style: const TextStyle(
                                    color: Color(0xFF0D8ABC),
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Stack(
                            children: [
                              Container(height: 8, color: const Color(0xFFF1F5F9)),
                              FractionallySizedBox(
                                widthFactor: p1Pct,
                                child: Container(height: 8, color: const Color(0xFF0D8ABC)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // VS Badge
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Text('VS',
                                style: TextStyle(
                                    color: Color(0xFF1E293B),
                                    fontSize: 32,
                                    fontStyle: FontStyle.italic,
                                    fontWeight: FontWeight.w900)),
                          ),
                        ),
                        if (activeBattle == null) ...[
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () async {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Mencari lawan...')),
                              );
                              final msg = await provider.matchmakeBattle();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(msg)),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0D8ABC),
                              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.search, color: Colors.white, size: 20),
                                SizedBox(width: 8),
                                Text('Cari Lawan Otomatis',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Lawan Card
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: const Border(right: BorderSide(color: Color(0xFFF43F5E), width: 4)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFF43F5E).withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFF43F5E), width: 4),
                          ),
                          child: CircleAvatar(
                            radius: 40,
                            backgroundColor: const Color(0xFFF1F5F9),
                            child: Text(
                              opponentName != 'Menunggu Lawan' && opponentName.isNotEmpty ? opponentName[0].toUpperCase() : '?',
                              style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 32, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(opponentName,
                            style: const TextStyle(
                                color: Color(0xFF1E293B),
                                fontSize: 24,
                                fontWeight: FontWeight.bold)),
                        const Text('Lawan',
                            style: TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('$p2',
                                style: const TextStyle(
                                    color: Color(0xFFF43F5E),
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900)),
                            const Text('Skor Saat Ini',
                                style: TextStyle(
                                    color: Color(0xFF64748B),
                                    fontSize: 14)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Stack(
                            children: [
                              Container(height: 8, color: const Color(0xFFF1F5F9)),
                              Align(
                                alignment: Alignment.centerRight,
                                child: FractionallySizedBox(
                                  widthFactor: p2Pct,
                                  child: Container(height: 8, color: const Color(0xFFF43F5E)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Stats Details
                  const Text('Detail Pertandingan 1v1',
                      style: TextStyle(
                          color: Color(0xFF1E293B),
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Statistik pertandingan minggu ini.',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: filteredStats.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(24.0),
                            child: Center(
                              child: Text('Belum ada poin yang dicetak.',
                                  style: TextStyle(color: Color(0xFF94A3B8), fontStyle: FontStyle.italic)),
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: filteredStats.length,
                            separatorBuilder: (context, index) =>
                                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                            itemBuilder: (context, index) {
                              final row = filteredStats[index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(
                                  children: [
                                    Expanded(
                                      flex: 2,
                                      child: Text(
                                        row['label'] as String,
                                        style: const TextStyle(
                                          color: Color(0xFF1E293B),
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        '${row['p1']} pts',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Color(0xFF0D8ABC),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        '${row['p2']} pts',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Colors.redAccent,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),

                  const SizedBox(height: 32),

                  // Battle History
                  const Text('Riwayat Pertandingan 1v1',
                      style: TextStyle(
                          color: Color(0xFF1E293B),
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Rekam jejak performa dalam arena terakhir.',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: historyList.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(24.0),
                            child: Center(
                              child: Text('Belum ada riwayat pertandingan.',
                                  style: TextStyle(color: Color(0xFF94A3B8), fontStyle: FontStyle.italic)),
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: historyList.length,
                            separatorBuilder: (context, index) =>
                                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                            itemBuilder: (context, index) {
                              final history = historyList[index];
                              final isWinner = history.result.toLowerCase() == 'menang';
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            history.date ?? '-',
                                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            history.opponent,
                                            style: const TextStyle(
                                              color: Color(0xFF1E293B),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isWinner ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: isWinner ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2)),
                                      ),
                                      child: Text(
                                        history.result.toUpperCase(),
                                        style: TextStyle(
                                          color: isWinner ? Colors.green : Colors.red,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Text(
                                      '${history.points} pts',
                                      style: const TextStyle(
                                        color: Color(0xFF0D8ABC),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                  const SizedBox(height: 32),
                  // Points Guide
                  const Text('Cara Mendapatkan Poin',
                      style: TextStyle(
                          color: Color(0xFF1E293B),
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Kumpulkan poin sebanyak-banyaknya untuk memenangkan arena dan tukarkan di Toko Poin!',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ]
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildPointGuideItem(Icons.payments_rounded, 'Membayar Iuran', 'Dapatkan poin setiap kali Anda membayar iuran tepat waktu.'),
                        const SizedBox(height: 12),
                        _buildPointGuideItem(Icons.savings_rounded, 'Menabung', 'Setor simpanan sukarela untuk mendapatkan bonus poin.'),
                        const SizedBox(height: 12),
                        _buildPointGuideItem(Icons.storefront_rounded, 'Transaksi Toko', 'Beli atau jual barang di Toko / Marketplace Koperasi.'),
                        const SizedBox(height: 12),
                        _buildPointGuideItem(Icons.task_alt_rounded, 'Misi Koperasi', 'Selesaikan misi dan dapatkan reward poin melimpah!'),
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
  Widget _buildPointGuideItem(IconData icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFFACC15).withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: const Color(0xFFFACC15), size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 2),
              Text(description, style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}
