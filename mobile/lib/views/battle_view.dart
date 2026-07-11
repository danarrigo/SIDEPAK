import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'widgets/use_item_sheet.dart';

class BattleView extends StatefulWidget {
  const BattleView({super.key});

  @override
  State<BattleView> createState() => _BattleViewState();
}

class _BattleViewState extends State<BattleView> {
  bool _matchmakingStarted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAndMatchmake();
    });
  }

  void _checkAndMatchmake() {
    final provider = Provider.of<KoperasiProvider>(context, listen: false);
    if (provider.activeBattle == null && !_matchmakingStarted) {
      setState(() {
        _matchmakingStarted = true;
      });
      provider.matchmakeBattle().then((msg) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(msg),
              behavior: SnackBarBehavior.floating,
            ),
          );
          setState(() {
            _matchmakingStarted = false;
          });
        }
      }).catchError((_) {
        if (mounted) {
          setState(() {
            _matchmakingStarted = false;
          });
        }
      });
    }
  }

  int safeParseInt(dynamic val) {
    if (val == null) return 0;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val) ?? 0;
    return 0;
  }

  String formatNumber(int num) {
    return num.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final activeBattle = provider.activeBattle;

    final myStats = provider.myStats ??
        {
          'missionsCompleted': 0,
          'totalSavings': 0,
          'savingsPts': 0,
          'activeStreak': 0,
          'eventsJoined': 0,
          'shopPurchases': 0,
          'marketplaceActivity': 0,
          'loansCount': 0,
          'battlesWon': 0,
          'duesPts': 0
        };
    final opStats = provider.opStats ??
        {
          'missionsCompleted': 0,
          'totalSavings': 0,
          'savingsPts': 0,
          'activeStreak': 0,
          'eventsJoined': 0,
          'shopPurchases': 0,
          'marketplaceActivity': 0,
          'loansCount': 0,
          'battlesWon': 0,
          'duesPts': 0
        };

    final historyList = provider.historyList;
    final memberId = provider.memberId;
    final myName = provider.fullName?.split(' ')[0] ?? "Anda";

    final currentMatch = provider.currentMatch;
    final rivalCooperative = provider.rivalCooperative;
    final bool isCoopA = currentMatch?['isCoopA'] ?? true;
    final int scoreA = safeParseInt(currentMatch?['scoreA']);
    final int scoreB = safeParseInt(currentMatch?['scoreB']);
    final int myCoopScore = isCoopA ? scoreA : scoreB;
    final int rivalCoopScore = isCoopA ? scoreB : scoreA;
    final String rivalCoopName = rivalCooperative?['name'] ?? "Koperasi Rival";

    int p1 = 0;
    int p2 = 0;
    String opponentName = 'Menunggu Lawan';
    int? opponentId;

    if (activeBattle != null) {
      final challengerId = activeBattle['challengerId'];
      int dbP1 = 0;
      int dbP2 = 0;
      if (challengerId == memberId) {
        dbP1 = safeParseInt(activeBattle['challengerPoints']);
        dbP2 = safeParseInt(activeBattle['opponentPoints']);
      } else {
        dbP1 = safeParseInt(activeBattle['opponentPoints']);
        dbP2 = safeParseInt(activeBattle['challengerPoints']);
      }

      // Calculate dynamic score as sum of point categories
      final calcP1 = safeParseInt(myStats['missionsCompleted']) +
          safeParseInt(myStats['savingsPts']) +
          safeParseInt(myStats['activeStreak']) +
          safeParseInt(myStats['duesPts']) +
          safeParseInt(myStats['shopPurchases']) +
          safeParseInt(myStats['marketplaceActivity']) +
          safeParseInt(myStats['eventsJoined']) +
          safeParseInt(myStats['loansCount']) +
          safeParseInt(myStats['battlesWon']);

      final calcP2 = safeParseInt(opStats['missionsCompleted']) +
          safeParseInt(opStats['savingsPts']) +
          safeParseInt(opStats['activeStreak']) +
          safeParseInt(opStats['duesPts']) +
          safeParseInt(opStats['shopPurchases']) +
          safeParseInt(opStats['marketplaceActivity']) +
          safeParseInt(opStats['eventsJoined']) +
          safeParseInt(opStats['loansCount']) +
          safeParseInt(opStats['battlesWon']);

      p1 = calcP1 > 0 ? calcP1 : dbP1;
      p2 = calcP2 > 0 ? calcP2 : dbP2;

      final op = activeBattle['opponent'];
      if (op != null) {
        opponentId = op['id'] as int?;
        if (op['namaLengkap'] != null) {
          opponentName = (op['namaLengkap'] as String).split(' ')[0];
        }
      }
    }
    double p1Pct = (p1 / 10000).clamp(0.0, 1.0);
    double p2Pct = (p2 / 10000).clamp(0.0, 1.0);

    final statRows = [
      {
        'label': 'Misi Harian',
        'p1': myStats['missionsCompleted'] ?? 0,
        'p2': opStats['missionsCompleted'] ?? 0
      },
      {
        'label': 'Penyetoran Tabungan',
        'p1': myStats['savingsPts'] ?? 0,
        'p2': opStats['savingsPts'] ?? 0
      },
      {
        'label': 'Konsistensi Login (Streak)',
        'p1': myStats['activeStreak'] ?? 0,
        'p2': opStats['activeStreak'] ?? 0
      },
      {
        'label': 'Membayar Iuran',
        'p1': myStats['duesPts'] ?? 0,
        'p2': opStats['duesPts'] ?? 0
      },
      {
        'label': 'Belanja di Koperasi',
        'p1': myStats['shopPurchases'] ?? 0,
        'p2': opStats['shopPurchases'] ?? 0
      },
      {
        'label': 'Aktivitas Marketplace',
        'p1': myStats['marketplaceActivity'] ?? 0,
        'p2': opStats['marketplaceActivity'] ?? 0
      },
      {
        'label': 'Partisipasi Acara',
        'p1': myStats['eventsJoined'] ?? 0,
        'p2': opStats['eventsJoined'] ?? 0
      },
      {
        'label': 'Peminjaman Dana',
        'p1': myStats['loansCount'] ?? 0,
        'p2': opStats['loansCount'] ?? 0
      },
      {
        'label': 'Kemenangan Battle',
        'p1': myStats['battlesWon'] ?? 0,
        'p2': opStats['battlesWon'] ?? 0
      },
    ];
    final filteredStats = statRows
        .where(
            (row) => safeParseInt(row['p1']) > 0 || safeParseInt(row['p2']) > 0)
        .toList();

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      color: const Color(0xFF0F172A),
      backgroundColor: Colors.white,
      child: Container(
        height: double.infinity,
        color: const Color(0xFFF1F5F9), // Light theme background
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding:
              const EdgeInsets.only(top: 50, left: 16, right: 16, bottom: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              const Padding(
                padding: EdgeInsets.only(top: 16.0, bottom: 16.0),
                child: Column(
                  children: [
                    Text(
                      'MUSIM 1',
                      style: TextStyle(
                        color: Color(0xFFFACC15),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Liga Koperasi',
                      style: TextStyle(
                        color: Color(0xFF0F172A),
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              // Guild Wars Card
              if (currentMatch != null) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF0F172A).withOpacity(0.1),
                        const Color(0xFFFACC15).withOpacity(0.1),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: const Color(0xFF0F172A).withOpacity(0.2)),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        left: -20,
                        right: -20,
                        top: -20,
                        height: 4,
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF0F172A), Color(0xFFFACC15)],
                            ),
                          ),
                        ),
                      ),
                      Column(
                        children: [
                          const Text(
                            'MINGGU INI VS RIVAL',
                            style: TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    const Text(
                                      'ANDA',
                                      style: TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '$myCoopScore',
                                      style: const TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontSize: 30,
                                          fontWeight: FontWeight.w900),
                                    ),
                                  ],
                                ),
                              ),
                              const Text(
                                'VS',
                                style: TextStyle(
                                    color: Color(0xFFCBD5E1),
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    fontStyle: FontStyle.italic),
                              ),
                              Expanded(
                                child: Column(
                                  children: [
                                    const Text(
                                      'RIVAL',
                                      style: TextStyle(
                                          color: Color(0xFFEF4444),
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '$rivalCoopScore',
                                      style: const TextStyle(
                                          color: Color(0xFFEF4444),
                                          fontSize: 30,
                                          fontWeight: FontWeight.w900),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            rivalCoopName,
                            style: const TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 12,
                                fontWeight: FontWeight.w500),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Player 1 Card (Anda)
              Container(
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.85),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    Positioned(
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      child: Container(color: const Color(0xFF0F172A)),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 32),
                      child: Column(
                        children: [
                          Container(
                            width: 160,
                            height: 160,
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: const Color(0xFF0F172A), width: 4),
                            ),
                            child: CircleAvatar(
                              backgroundColor: const Color(0xFFE2E8F0),
                              child: Text(
                                myName.isNotEmpty
                                    ? myName[0].toUpperCase()
                                    : 'A',
                                style: const TextStyle(
                                    color: Color(0xFF0F172A),
                                    fontSize: 64,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            myName,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (provider.koperasiName != null) ...[
                            Text(
                              provider.koperasiName!,
                              style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                          ],
                          const Text(
                            'Anda',
                            style: TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Gunakan Item Button
                          if (activeBattle != null && opponentId != null) ...[
                            ElevatedButton.icon(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.white,
                                  shape: const RoundedRectangleBorder(
                                    borderRadius: BorderRadius.vertical(
                                        top: Radius.circular(24)),
                                  ),
                                  builder: (context) =>
                                      UseItemSheet(targetMemberId: opponentId),
                                );
                              },
                              icon: const Icon(Icons.auto_fix_high,
                                  size: 16, color: Colors.white),
                              label: const Text(
                                'Gunakan Item',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0F172A),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                elevation: 4,
                                shadowColor:
                                    const Color(0xFF0F172A).withOpacity(0.2),
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Skor Saat Ini',
                                style: TextStyle(
                                    color: Color(0xFF64748B), fontSize: 14),
                              ),
                              Text(
                                '$p1',
                                style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Stack(
                              children: [
                                Container(
                                    height: 8, color: const Color(0xFFE2E8F0)),
                                FractionallySizedBox(
                                  widthFactor: p1Pct,
                                  child: Container(
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // VS Indicator & Matchmaking
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'VS',
                          style: TextStyle(
                            color: Color(0xFF0F172A),
                            fontSize: 32,
                            fontStyle: FontStyle.italic,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    if (activeBattle == null) ...[
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              color: Color(0xFFFACC15), // tertiary gold color
                              strokeWidth: 2,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Mencari Lawan...',
                            style: TextStyle(
                              color: const Color(0xFFFACC15),
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Player 2 Card (Lawan)
              Container(
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.85),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      child: Container(color: const Color(0xFFFACC15)),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 32),
                      child: Column(
                        children: [
                          Container(
                            width: 160,
                            height: 160,
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: const Color(0xFFFACC15), width: 4),
                            ),
                            child: CircleAvatar(
                              backgroundColor: const Color(0xFFE2E8F0),
                              child: Text(
                                opponentName != 'Menunggu Lawan' &&
                                        opponentName.isNotEmpty
                                    ? opponentName[0].toUpperCase()
                                    : '?',
                                style: const TextStyle(
                                    color: Color(0xFFFACC15),
                                    fontSize: 64,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            opponentName,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (rivalCooperative?['name'] != null &&
                              activeBattle != null) ...[
                            Text(
                              rivalCooperative!['name']!,
                              style: const TextStyle(
                                  color: Color(0xFFFACC15),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                          ],
                          const Text(
                            'Lawan',
                            style: TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Skor Saat Ini',
                                style: TextStyle(
                                    color: Color(0xFF64748B), fontSize: 14),
                              ),
                              Text(
                                '$p2',
                                style: const TextStyle(
                                  color: Color(0xFFFACC15),
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Stack(
                              children: [
                                Container(
                                    height: 8, color: const Color(0xFFE2E8F0)),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: FractionallySizedBox(
                                    widthFactor: p2Pct,
                                    child: Container(
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFFACC15),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 64),

              // Detail Pertandingan 1v1
              const Text(
                'Detail Pertandingan 1v1',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Statistik pertandingan minggu ini.',
                style: TextStyle(color: const Color(0xFF64748B), fontSize: 12),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: filteredStats.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Center(
                          child: Text(
                            'Belum ada poin yang dicetak.',
                            style: TextStyle(
                                color: const Color(0xFF64748B).withOpacity(0.6),
                                fontStyle: FontStyle.italic),
                          ),
                        ),
                      )
                    : Column(
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              color: Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.vertical(
                                  top: Radius.circular(20)),
                            ),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 32, vertical: 20),
                            child: const Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Statistik',
                                    style: TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    'Anda',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    'Lawan',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: Color(0xFFFACC15),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Divider(height: 1, color: const Color(0xFFE2E8F0)),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: filteredStats.length,
                            separatorBuilder: (context, index) => Divider(
                                height: 1, color: const Color(0xFFE2E8F0)),
                            itemBuilder: (context, index) {
                              final row = filteredStats[index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                child: Row(
                                  children: [
                                    Expanded(
                                      flex: 2,
                                      child: Text(
                                        row['label'] as String,
                                        style: const TextStyle(
                                            color: Color(0xFF0F172A),
                                            fontSize: 16),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        '${row['p1']} pts',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        '${row['p2']} pts',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Color(0xFFFACC15),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
              ),

              const SizedBox(height: 64),

              // Riwayat Pertandingan 1v1
              const Text(
                'Riwayat Pertandingan 1v1',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Rekam jejak performa dalam arena terakhir.',
                style: TextStyle(color: const Color(0xFF64748B), fontSize: 12),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: historyList.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Center(
                          child: Text(
                            'Belum ada riwayat pertandingan.',
                            style: TextStyle(
                                color: const Color(0xFF64748B).withOpacity(0.6),
                                fontStyle: FontStyle.italic),
                          ),
                        ),
                      )
                    : Column(
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              color: Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.vertical(
                                  top: Radius.circular(20)),
                            ),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 32, vertical: 20),
                            child: const Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    'Tanggal & Lawan',
                                    style: TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                SizedBox(
                                  width: 80,
                                  child: Text(
                                    'Status',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                SizedBox(
                                  width: 100,
                                  child: Text(
                                    'Skor Akhir',
                                    textAlign: TextAlign.right,
                                    style: TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Divider(height: 1, color: const Color(0xFFE2E8F0)),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: historyList.length,
                            separatorBuilder: (context, index) => Divider(
                                height: 1, color: const Color(0xFFE2E8F0)),
                            itemBuilder: (context, index) {
                              final history = historyList[index];
                              final isWinner =
                                  history.result.toLowerCase() == 'menang';
                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            history.date ?? '-',
                                            style: const TextStyle(
                                                color: Color(0xFF64748B),
                                                fontSize: 14),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            history.opponent,
                                            style: const TextStyle(
                                              color: Color(0xFF0F172A),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    SizedBox(
                                      width: 80,
                                      child: Center(
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: isWinner
                                                ? const Color(0xFF10B981)
                                                    .withOpacity(0.12)
                                                : const Color(0xFFEF4444)
                                                    .withOpacity(0.12),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                            border: Border.all(
                                              color: isWinner
                                                  ? const Color(0xFF10B981)
                                                      .withOpacity(0.2)
                                                  : const Color(0xFFEF4444)
                                                      .withOpacity(0.2),
                                            ),
                                          ),
                                          child: Text(
                                            history.result.toUpperCase(),
                                            style: TextStyle(
                                              color: isWinner
                                                  ? const Color(0xFF10B981)
                                                  : const Color(0xFFEF4444),
                                              fontSize: 10,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 100,
                                      child: Text(
                                        '${history.points} pts',
                                        textAlign: TextAlign.right,
                                        style: const TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
              ),

              const SizedBox(height: 64),

              // Points Guide Header with Help Icon
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.help_outline,
                        color: Color(0xFF0F172A), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Cara Mendapatkan Poin',
                          style: TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 18,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Kumpulkan poin sebanyak-banyaknya untuk memenangkan arena dan tukarkan di Toko Poin!',
                          style: TextStyle(
                              color: const Color(0xFF64748B), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPointGuideItem(
                        Icons.payments_rounded,
                        'Membayar Iuran',
                        'Dapatkan poin setiap kali Anda membayar iuran wajib atau pokok tepat waktu.',
                        const Color(0xFFF59E0B)),
                    const SizedBox(height: 16),
                    _buildPointGuideItem(
                        Icons.savings_rounded,
                        'Menabung',
                        'Setor simpanan sukarela untuk mendapatkan bonus poin secara berkala.',
                        const Color(0xFF10B981)),
                    const SizedBox(height: 16),
                    _buildPointGuideItem(
                        Icons.storefront_rounded,
                        'Transaksi Toko',
                        'Beli atau jual barang di Toko / Marketplace Koperasi.',
                        const Color(0xFF3B82F6)),
                    const SizedBox(height: 16),
                    _buildPointGuideItem(
                        Icons.task_alt_rounded,
                        'Misi Koperasi',
                        'Selesaikan misi dan dapatkan reward poin melimpah!',
                        const Color(0xFF8B5CF6)),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Papan Peringkat Liga (Top 50)
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 18),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(16)),
                        border: Border(
                            bottom: BorderSide(color: Color(0xFFE2E8F0))),
                      ),
                      child: const Row(
                        children: [
                          Text(
                            'Klasemen Liga (Top 50)',
                            style: TextStyle(
                                color: Color(0xFF0F172A),
                                fontSize: 16,
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    if (provider.leaderboard.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(24.0),
                        child: Text(
                          'Belum ada data skor di musim ini.',
                          style: TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 14,
                              fontStyle: FontStyle.italic),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: provider.leaderboard.length > 50
                            ? 50
                            : provider.leaderboard.length,
                        separatorBuilder: (context, index) =>
                            const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        itemBuilder: (context, index) {
                          final item = provider.leaderboard[index];
                          final isMineByName =
                              item['koperasiName'] == provider.koperasiName;
                          return Container(
                            color: isMineByName
                                ? const Color(0xFF0F172A).withOpacity(0.05)
                                : Colors.transparent,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 16),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 28,
                                  child: Text(
                                    index == 0
                                        ? '🥇'
                                        : index == 1
                                            ? '🥈'
                                            : index == 2
                                                ? '🥉'
                                                : '${index + 1}',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              item['koperasiName'] ?? '-',
                                              style: TextStyle(
                                                color: isMineByName
                                                    ? const Color(0xFF0F172A)
                                                    : const Color(0xFF0F172A),
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (isMineByName) ...[
                                            const SizedBox(width: 8),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF0F172A),
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              child: const Text(
                                                'ANDA',
                                                style: TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                    letterSpacing: 0.5),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Text('${item['totalWins'] ?? 0} W',
                                              style: const TextStyle(
                                                  color: Color(0xFF0F172A),
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold)),
                                          const SizedBox(width: 8),
                                          Text('${item['totalDraws'] ?? 0} D',
                                              style: const TextStyle(
                                                  color: Color(0xFF64748B),
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold)),
                                          const SizedBox(width: 8),
                                          Text('${item['totalLosses'] ?? 0} L',
                                              style: const TextStyle(
                                                  color: Color(0xFFEF4444),
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '${formatNumber(item['totalPoints'] ?? 0)} Poin',
                                  style: const TextStyle(
                                      color: Color(0xFFFACC15),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPointGuideItem(
      IconData icon, String title, String description, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(
                      color: Color(0xFF0F172A),
                      fontWeight: FontWeight.bold,
                      fontSize: 13)),
              const SizedBox(height: 4),
              Text(description,
                  style:
                      const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
            ],
          ),
        ),
      ],
    );
  }
}
