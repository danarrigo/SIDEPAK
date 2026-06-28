import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Koperasi Sukamaju',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: const Color(0xFF0F172A),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFFFACC15),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainNavigationWrapper(),
    );
  }
}

// Data models
class Mission {
  final String id;
  final String title;
  final int points;
  bool completed;
  final bool isDaily;

  Mission({
    required this.id,
    required this.title,
    required this.points,
    required this.completed,
    required this.isDaily,
  });
}

class ShopItem {
  final String id;
  final String title;
  final String description;
  final int cost;
  int ownedCount;
  final IconData icon;
  final Color iconColor;
  final Color bgGlow;

  ShopItem({
    required this.id,
    required this.title,
    required this.description,
    required this.cost,
    required this.ownedCount,
    required this.icon,
    required this.iconColor,
    required this.bgGlow,
  });
}

class HistoryItem {
  final String opponent;
  final String result;
  final int points;

  HistoryItem({
    required this.opponent,
    required this.result,
    required this.points,
  });
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;

  // Global State
  int points = 1350;
  int streak = 14;
  int userWinRate = 62;
  String? voteSelection;
  bool isLoading = true;

  // Savings breakdown
  int simpananPokok = 750000;
  int simpananWajib = 750000;
  int simpananSukarela = 7254000;
  List<dynamic> listSavings = [];
  List<dynamic> listLoans = [];
  Map<String, dynamic>? activeBattle;

  // Koperasi Stats
  int kopTransaksi = 37;
  int kopAnggotaBaru = 8;
  int kopOmzet = 14;
  int kopUmkm = 12;

  // Streak days
  final Map<String, bool> streakDays = {
    'Sen': true,
    'Sel': true,
    'Rab': true,
    'Kam': true, // Today (Active/Fire)
    'Jum': false,
    'Sab': false,
    'Min': false,
  };

  // Missions
  late List<Mission> missions;

  // Shop Items
  late List<ShopItem> shopItems;

  // Match History
  final List<HistoryItem> historyList = [
    HistoryItem(opponent: 'Siti Maenah', result: 'Menang', points: 150),
    HistoryItem(opponent: 'Roland Sihombing', result: 'Menang', points: 150),
    HistoryItem(opponent: 'Ahmad Fauzi', result: 'Kalah', points: 50),
    HistoryItem(opponent: 'Andreas Kurniawan', result: 'Menang', points: 150),
  ];

  @override
  void initState() {
    super.initState();
    missions = [
      Mission(id: 'd1', title: 'Belanja hari ini', points: 20, completed: true, isDaily: true),
      Mission(id: 'd2', title: 'Hadir RAT', points: 50, completed: false, isDaily: true),
      Mission(id: 'd3', title: 'Baca berita koperasi', points: 15, completed: false, isDaily: true),
      Mission(id: 'd4', title: 'Isi Survey Anggota', points: 15, completed: false, isDaily: true),
      Mission(id: 'w1', title: 'Hadiri rapat tahunan', points: 120, completed: false, isDaily: false),
      Mission(id: 'w2', title: 'Ajak Anggota baru', points: 200, completed: false, isDaily: false),
    ];

    shopItems = [
      ShopItem(
        id: 's1',
        title: 'Freeze Streak',
        description: 'Bekukan streak lawan selama 1 ronde',
        cost: 200,
        ownedCount: 2,
        icon: Icons.ac_unit,
        iconColor: Colors.teal,
        bgGlow: Colors.teal.withOpacity(0.1),
      ),
      ShopItem(
        id: 's2',
        title: 'Point Bomb',
        description: 'Kurangi 50 poin lawan minggu ini',
        cost: 350,
        ownedCount: 0,
        icon: Icons.dangerous,
        iconColor: Colors.pink,
        bgGlow: Colors.pink.withOpacity(0.1),
      ),
      ShopItem(
        id: 's3',
        title: 'Streak Shield',
        description: 'Proteksi Streak dari Freeze Streak lawan',
        cost: 150,
        ownedCount: 0,
        icon: Icons.shield,
        iconColor: Colors.orange,
        bgGlow: Colors.orange.withOpacity(0.1),
      ),
      ShopItem(
        id: 's4',
        title: 'Poin Booster',
        description: '2x poin dari semua quest hari ini',
        cost: 500,
        ownedCount: 1,
        icon: Icons.rocket_launch,
        iconColor: Colors.purple,
        bgGlow: Colors.amber.withOpacity(0.1),
      ),
    ];

    fetchData();
  }

  Future<void> fetchData() async {
    try {
      String apiHost = 'localhost:3000';
      // Dynamically resolve host when running in a web browser
      if (Uri.base.host.isNotEmpty) {
        apiHost = '${Uri.base.host}:3000';
      }
      final response = await http.get(Uri.parse('http://$apiHost/api/mobile-sync'));
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['success']) {
          final data = jsonResponse['data'];
          
          final progress = data['dashboard']?['progress'];
          if (progress != null) {
            points = progress['pointsBalance'] ?? points;
            streak = progress['currentStreak'] ?? streak;
          }

          final financials = data['financials'];
          if (financials != null) {
            List dues = financials['dues'] ?? [];
            List savings = financials['savings'] ?? [];
            simpananPokok = dues.where((d) => d['type'] == 'initial').fold<int>(0, (s, i) => s + (i['amount'] as int));
            simpananWajib = dues.where((d) => d['type'] == 'monthly').fold<int>(0, (s, i) => s + (i['amount'] as int));
            simpananSukarela = savings.fold<int>(0, (s, i) => s + (i['type'] == 'deposit' ? (i['amount'] as int) : -(i['amount'] as int)));
            listSavings = savings;
            listLoans = financials['loans'] ?? [];
          }

          final quests = data['quests'];
          if (quests != null && quests is List) {
            missions = quests.map<Mission>((q) {
              return Mission(
                id: q['id'].toString(),
                title: q['title'] ?? '',
                points: q['rewardPoints'] ?? 0,
                completed: q['progress']?['isCompleted'] ?? false,
                isDaily: q['category'] == 'daily',
              );
            }).toList();
          }

          final kopStats = data['koperasiStats'];
          if (kopStats != null) {
            kopTransaksi = kopStats['transaksi'] ?? kopTransaksi;
            kopAnggotaBaru = kopStats['anggotaBaru'] ?? kopAnggotaBaru;
            kopOmzet = kopStats['omzetHarian'] ?? kopOmzet;
            kopUmkm = kopStats['umkmAktif'] ?? kopUmkm;
          }

          final arena = data['arena'];
          if (arena != null && arena['activeBattles'] != null && (arena['activeBattles'] as List).isNotEmpty) {
            activeBattle = arena['activeBattles'][0];
          }

          setState(() { isLoading = false; });
        } else {
          setState(() { isLoading = false; });
        }
      } else {
        setState(() { isLoading = false; });
      }
    } catch (e) {
      print('Fetch err: $e');
      setState(() { isLoading = false; });
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void toggleMission(String id) {
    setState(() {
      for (var m in missions) {
        if (m.id == id) {
          m.completed = !m.completed;
          if (m.completed) {
            points += m.points;
            _showSnackBar('Misi "${m.title}" selesai! +${m.points} Poin');
          } else {
            points -= m.points;
            _showSnackBar('Batal menyelesaikan "${m.title}". Poin -${m.points}');
          }
          break;
        }
      }
    });
  }

  void buyShopItem(ShopItem item) {
    if (points >= item.cost) {
      setState(() {
        points -= item.cost;
        item.ownedCount += 1;
        _showSnackBar('Berhasil membeli ${item.title}! -${item.cost} Poin');
      });
    } else {
      _showSnackBar('Poin tidak mencukupi untuk membeli ${item.title}');
    }
  }

  void useItemInBattle(ShopItem item) {
    if (item.ownedCount > 0) {
      setState(() {
        item.ownedCount -= 1;
        int boost = 0;
        String log = '';
        if (item.id == 's1') {
          boost = 8;
          log = 'Menggunakan Freeze Streak! Win rate bertambah +8%';
        } else if (item.id == 's2') {
          boost = 12;
          log = 'Meledakkan Point Bomb! Win rate bertambah +12%';
        } else if (item.id == 's3') {
          boost = 3;
          log = 'Streak Shield diaktifkan! Win rate bertambah +3%';
        } else if (item.id == 's4') {
          boost = 15;
          log = 'Poin Booster digunakan! Peluang menang naik +15%';
        }
        userWinRate = (userWinRate + boost).clamp(0, 100);
        _showSnackBar(log);
      });
    } else {
      _showSnackBar('Kamu tidak memiliki item ini. Beli di Toko Misi.');
    }
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return HomeView(
          points: points,
          streak: streak,
          simpananPokok: simpananPokok,
          simpananWajib: simpananWajib,
          simpananSukarela: simpananSukarela,
          kopTransaksi: kopTransaksi,
          kopAnggotaBaru: kopAnggotaBaru,
          kopOmzet: kopOmzet,
          kopUmkm: kopUmkm,
          missions: missions.where((m) => m.isDaily).toList(),
          onToggleMission: toggleMission,
          onNavigate: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
        );
      case 1:
        return MisiView(
          points: points,
          streak: streak,
          streakDays: streakDays,
          missions: missions,
          shopItems: shopItems,
          onToggleMission: toggleMission,
          onBuyItem: buyShopItem,
        );
      case 2:
        return BattleView(
          userWinRate: userWinRate,
          historyList: historyList,
          shopItems: shopItems,
          onUseItem: useItemInBattle,
          activeBattle: activeBattle,
        );
      case 3:
        return KoperasiView(
          voteSelection: voteSelection,
          onVote: (choice) {
            setState(() {
              voteSelection = choice;
            });
            _showSnackBar('Terima kasih! Pilihan Anda ($choice) disimpan.');
          },
        );
      case 4:
        return ProfileView(
          streak: streak,
          onLogout: () {
            _showSnackBar('Keluar dari sesi...');
          },
          listSavings: listSavings,
          listLoans: listLoans,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Scaffold matching the mobile structure
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: isLoading ? const Center(child: CircularProgressIndicator()) : _buildBody(),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0B1120),
          border: Border(
            top: BorderSide(color: Colors.white10, width: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black45,
              blurRadius: 20,
              offset: Offset(0, -4),
            )
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildNavItem(0, Icons.home, 'Beranda'),
              _buildNavItem(1, Icons.assignment, 'Misi'),
              _buildNavItem(2, Icons.bolt, 'Bertanding'),
              _buildNavItem(3, Icons.account_balance, 'Koperasi'),
              _buildNavItem(4, Icons.person, 'Profil'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isActive = _currentIndex == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          padding: EdgeInsets.symmetric(vertical: isActive ? 8 : 6, horizontal: 2),
          decoration: isActive
              ? BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFFACC15).withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                )
              : const BoxDecoration(color: Colors.transparent),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                child: Icon(
                  icon,
                  color: isActive ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                  size: isActive ? 28 : 24,
                  shadows: isActive
                      ? [
                          Shadow(
                            color: const Color(0xFFFACC15).withOpacity(0.5),
                            blurRadius: 12,
                          )
                        ]
                      : null,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  color: isActive ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                  fontSize: isActive ? 10.5 : 9,
                  fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
                  fontFamily: 'Inter',
                ),
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ----------------- SCREEN 1: HOME VIEW -----------------
class HomeView extends StatelessWidget {
  final int points;
  final int streak;
  final int simpananPokok;
  final int simpananWajib;
  final int simpananSukarela;
  final int kopTransaksi;
  final int kopAnggotaBaru;
  final int kopOmzet;
  final int kopUmkm;
  final List<Mission> missions;
  final Function(String) onToggleMission;
  final Function(int) onNavigate;

  const HomeView({
    super.key,
    required this.points,
    required this.streak,
    required this.simpananPokok,
    required this.simpananWajib,
    required this.simpananSukarela,
    required this.kopTransaksi,
    required this.kopAnggotaBaru,
    required this.kopOmzet,
    required this.kopUmkm,
    required this.missions,
    required this.onToggleMission,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    int totalSimpanan = simpananPokok + simpananWajib + simpananSukarela;
    double progress = (points / 1500).clamp(0.0, 1.0);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Section (Dark Blue-Gray Background)
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
            ),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Halo, Agung!',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Anggota Aktif',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Koperasi Merah Putih Desa Sukamaju',
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    // Notification Icon
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(12),
                      child: const Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(Icons.notifications, color: Colors.white, size: 24),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: CircleAvatar(
                              radius: 4,
                              backgroundColor: Colors.red,
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Streak Badge
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('🔥 ', style: TextStyle(fontSize: 12)),
                        Text(
                          '$streak hari Streak',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Main Body Padding
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              children: [
                // 1. Savings Card
                Transform.translate(
                  offset: const Offset(0, -32),
                  child: Card(
                    color: Colors.white,
                    surfaceTintColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    elevation: 4,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Container(
                          decoration: const BoxDecoration(
                            color: Color(0xFF718096),
                            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                          child: const Text(
                            'TOTAL SIMPANAN',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Rp ${totalSimpanan.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')},00',
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildSavingsDetail('Pokok', simpananPokok),
                                  _buildSavingsDetail('Wajib', simpananWajib),
                                  _buildSavingsDetail('Sukarela', simpananSukarela),
                                ],
                              ),
                              const SizedBox(height: 20),
                              OutlinedButton(
                                onPressed: () {},
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.black26),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('Mutasi Saldo', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                                    SizedBox(width: 6),
                                    Icon(Icons.arrow_forward, size: 14, color: Colors.grey),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                Transform.translate(
                  offset: const Offset(0, -16),
                  child: Column(
                    children: [
                      // 2. Points Card
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF9C3),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFFDE047)),
                        ),
                        padding: const EdgeInsets.all(20),
                        margin: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'SALDO POIN',
                                  style: TextStyle(
                                    color: Color(0xFF854D0E),
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFCD34D),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                  child: const Text(
                                    'Emas',
                                    style: TextStyle(
                                      color: Color(0xFF854D0E),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                const Icon(Icons.stars, color: Color(0xFFFACC15), size: 48),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.baseline,
                                      textBaseline: TextBaseline.alphabetic,
                                      children: [
                                        Text(
                                          points.toString(),
                                          style: const TextStyle(
                                            color: Color(0xFFFACC15),
                                            fontSize: 32,
                                            fontWeight: FontWeight.w900,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Text(
                                          'Poin',
                                          style: TextStyle(
                                            color: Color(0xFFFACC15),
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Text(
                                      'Anggota Emas',
                                      style: TextStyle(
                                        color: Color(0xFF854D0E),
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${1500 - points > 0 ? "${1500 - points} poin lagi menuju Platinum" : "Platinum Tercapai!"}',
                                      style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      '$points / 1500',
                                      style: const TextStyle(fontSize: 8, color: Colors.black87, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: progress,
                                    minHeight: 6,
                                    backgroundColor: Colors.white.withOpacity(0.5),
                                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFACC15)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // 3. Daily Mission Card
                      Card(
                        color: Colors.white,
                        surfaceTintColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Misi Hari Ini',
                                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                  ),
                                  Text(
                                    '+ 100 Poin Tersedia',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: missions.length > 3 ? 3 : missions.length,
                                separatorBuilder: (context, index) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final m = missions[index];
                                  return Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          GestureDetector(
                                            onTap: () => onToggleMission(m.id),
                                            child: Container(
                                              width: 24,
                                              height: 24,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: m.completed ? const Color(0xFFA3E635) : Colors.transparent,
                                                border: Border.all(
                                                  color: m.completed ? const Color(0xFFA3E635) : const Color(0xFF94A3B8),
                                                  width: 2,
                                                ),
                                              ),
                                              child: m.completed
                                                  ? const Icon(Icons.check, color: Colors.white, size: 14)
                                                  : null,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Text(
                                            m.title,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: m.completed ? Colors.grey : const Color(0xFF64748B),
                                              decoration: m.completed ? TextDecoration.lineThrough : null,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Text(
                                        '+ ${m.points}',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24)),
                                      ),
                                    ],
                                  );
                                },
                              ),
                              const SizedBox(height: 12),
                              GestureDetector(
                                onTap: () => onNavigate(1), // Go to Misi view
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text('Kelola Misi Selengkapnya', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.bold)),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward, size: 12, color: Color(0xFFFBBF24)),
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 4. Koperasi Hari Ini Section
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF718096),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Koperasi Hari ini',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                            ),
                            const SizedBox(height: 16),
                            GridView.count(
                              crossAxisCount: 2,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.5,
                              children: [
                                _buildCoopStat(Icons.swap_horiz, '$kopTransaksi', 'Transaksi'),
                                _buildCoopStat(Icons.attach_money, 'Rp $kopOmzet Jt', 'Omzet Harian'),
                                _buildCoopStat(Icons.groups, '$kopAnggotaBaru', 'Anggota Baru'),
                                _buildCoopStat(Icons.storefront, '$kopUmkm', 'UMKM Aktif'),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 5. Pengumuman
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'Pengumuman',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 128,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                _buildAnnouncementCard('RAT Buku 2025 - Hadiri & Dukung Koperasi', '15 Juli 2026'),
                                const SizedBox(width: 12),
                                _buildAnnouncementCard('Pembagian SHU Tahun Buku 2024 Bagi Seluruh Anggota...', '1 Juli 2026'),
                              ],
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSavingsDetail(String label, int val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
        ),
        const SizedBox(height: 2),
        Text(
          'Rp ${(val / 1000).toStringAsFixed(0)}rb',
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
        )
      ],
    );
  }

  Widget _buildCoopStat(IconData icon, String val, String title) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9).withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.grey, size: 20),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
          Text(title, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildAnnouncementCard(String title, String date) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: const Color(0xFF718096),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, height: 1.3),
          ),
          Text(
            date,
            style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

// ----------------- SCREEN 2: MISI VIEW (WITH STORE) -----------------
class MisiView extends StatelessWidget {
  final int points;
  final int streak;
  final Map<String, bool> streakDays;
  final List<Mission> missions;
  final List<ShopItem> shopItems;
  final Function(String) onToggleMission;
  final Function(ShopItem) onBuyItem;

  const MisiView({
    super.key,
    required this.points,
    required this.streak,
    required this.streakDays,
    required this.missions,
    required this.shopItems,
    required this.onToggleMission,
    required this.onBuyItem,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header (TopHeader)
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
                      decoration: BoxDecoration(
                        color: const Color(0xFFFCD34D),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: const Text(
                        'Rank: Emas',
                        style: TextStyle(color: Color(0xFF78350F), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Text(
                      '826 / 1.500 poin menuju Platinum',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
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
                          width: 180 * 0.55,
                          height: 6,
                          color: const Color(0xFFFCD34D),
                        ),
                      ),
                    )
                  ],
                ),
                // Streak Counter Widget
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
                            streak.toString(),
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
                // 1. WeeklyStreakCard
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
                          const Text(
                            'Streak Mingguan',
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: streakDays.entries.map((entry) {
                              final day = entry.key;
                              final done = entry.value;
                              final bool isToday = day == 'Kam';

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

                // 2. Daily Missions Checklist
                _buildMissionSectionCard('Misi Harian', true),
                const SizedBox(height: 16),

                // 3. Weekly Missions Checklist
                _buildMissionSectionCard('Misi Mingguan', false),
                const SizedBox(height: 16),


                // 6. Shop
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Toko Item', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                    Text('Saldo: $points Poin', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
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
                  children: shopItems.map((item) => _buildShopItemCard(item)).toList(),
                ),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMissionSectionCard(String title, bool isDaily) {
    final list = missions.where((m) => m.isDaily == isDaily).toList();
    final pointsAvailable = isDaily ? 100 : 380;

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
                Text(
                  '+ $pointsAvailable Poin Tersedia',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFFACC15)),
                )
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
                          onTap: () => onToggleMission(m.id),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: m.completed ? const Color(0xFF84CC16) : Colors.transparent,
                              border: Border.all(
                                color: m.completed ? const Color(0xFF84CC16) : const Color(0xFFCBD5E1),
                                width: 2,
                              ),
                            ),
                            child: m.completed
                                ? const Icon(Icons.check, color: Colors.white, size: 14)
                                : null,
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
                    Text(
                      '+ ${m.points}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFACC15)),
                    )
                  ],
                );
              },
            )
          ],
        ),
      ),
    );
  }



  Widget _buildShopItemCard(ShopItem item) {
    return Card(
      color: const Color(0xFF718096),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: item.bgGlow,
              blurRadius: 15,
            )
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(item.icon, color: item.iconColor, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              item.title,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Expanded(
              child: Text(
                item.description,
                textAlign: TextAlign.center,
                maxLines: 3,
                style: const TextStyle(color: Colors.white70, fontSize: 8.5),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('⭐', style: TextStyle(fontSize: 10)),
                const SizedBox(width: 2),
                Text(
                  '${item.cost} poin',
                  style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => onBuyItem(item),
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

// ----------------- SCREEN 3: BATTLE VIEW -----------------
class BattleView extends StatelessWidget {
  final int userWinRate;
  final List<HistoryItem> historyList;
  final List<ShopItem> shopItems;
  final Function(ShopItem) onUseItem;
  final Map<String, dynamic>? activeBattle;

  const BattleView({
    super.key,
    required this.userWinRate,
    required this.historyList,
    required this.shopItems,
    required this.onUseItem,
    required this.activeBattle,
  });

  void _showUseItemSheet(BuildContext context) {
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
                itemCount: shopItems.length,
                separatorBuilder: (c, idx) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = shopItems[index];
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
                              onUseItem(item);
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
    final int p1 = activeBattle != null ? (activeBattle!['challengerPoints'] ?? 8200) : 8200;
    final int p2 = activeBattle != null ? (activeBattle!['opponentPoints'] ?? 7500) : 7500;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header (MainHeader)
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
                    Text(
                      'Arena Bertanding',
                      style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Bertanding Mingguan – reset setiap senin 00:00',
                      style: TextStyle(color: Colors.white60, fontSize: 10),
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
                // 1. Current Battle Card
                Card(
                  color: const Color(0xFF6D7D91),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Battle Minggu Ini',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        
                        // VS layout
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildPlayerCol('AS', 'Agung (Kamu)', '$p1 Poin', Colors.grey),
                            const Text('VS', style: TextStyle(color: Colors.white38, fontSize: 20, fontStyle: FontStyle.italic, fontWeight: FontWeight.w900)),
                            _buildPlayerCol('BW', 'Budi', '$p2 Poin', Colors.grey),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Probabilities Bar
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Kamu $userWinRate%', style: const TextStyle(color: Color(0xFFF83A4C), fontSize: 10, fontWeight: FontWeight.bold)),
                                Text('${100 - userWinRate}% Lawan', style: const TextStyle(color: Color(0xFF39C2F6), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Row(
                                children: [
                                  Expanded(
                                    flex: userWinRate,
                                    child: Container(height: 10, color: const Color(0xFFF83A4C)),
                                  ),
                                  Expanded(
                                    flex: 100 - userWinRate,
                                    child: Container(height: 10, color: const Color(0xFF39C2F6)),
                                  )
                                ],
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Stats table comparison
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF5A6B7D),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _buildComparisonRow('Transaksi Minggu Ini', '8', '5'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Misi Diselesaikan', '12', '9'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Total Tabungan', 'Rp 8,25Jt', 'Rp 6,1Jt'),
                              const Divider(color: Colors.white12),
                              _buildComparisonRow('Kehadiran Acara', '2', '1'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Battle berakhir: Minggu, 29 June 2026 ; 23:59',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),

                        // Buttons
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

                // 2. Match History
                const Text(
                  'Riwayat Bertanding',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFCBD5E1), width: 2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: historyList.length,
                    separatorBuilder: (c, i) => const Divider(color: Colors.grey, height: 16),
                    itemBuilder: (context, index) {
                      final item = historyList[index];
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
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: isWin ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'vs ${item.opponent}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                          Text(
                            '+ ${item.points}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.orange),
                          ),
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
        Expanded(
          flex: 2,
          child: Text(metric, style: const TextStyle(color: Colors.white, fontSize: 11)),
        ),
        Expanded(
          child: Text(
            userVal,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFFF83A4C), fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: Text(
            oppVal,
            textAlign: TextAlign.right,
            style: const TextStyle(color: Color(0xFF39C2F6), fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

// ----------------- SCREEN 4: KOPERASI VIEW (GOVERNANCE) -----------------
class KoperasiView extends StatelessWidget {
  final String? voteSelection;
  final Function(String) onVote;

  const KoperasiView({
    super.key,
    required this.voteSelection,
    required this.onVote,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header (Governance)
          Container(
            color: const Color(0xFF111827),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 30),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dashboard Koperasi',
                  style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Koperasi Merah Putih Desa Sukamaju',
                  style: TextStyle(color: Colors.white60, fontSize: 12),
                )
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Monthly Statistics Section
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF718096), Color(0xFF4A5568)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Statistik Bulan Ini',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.5,
                          children: [
                            _buildWhiteStatCard('Total Anggota', '1.284', '+8 Minggu Ini'),
                            _buildWhiteStatCard('Pendapatan', 'Rp 840Jt', '+12% dari Minggu lalu'),
                            _buildWhiteStatCard('SHU Berjalan', 'Rp 120Jt', 'Estimasi', italic: true),
                            _buildWhiteStatCard('UMKM Aktif', '47', '+3 Bulan ini'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 2. Trust Levels Card
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Tingkat Kepercayaan',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                            ),
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                border: Border.all(color: const Color(0xFF86EFAC)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              child: const Text(
                                'Sangat baik',
                                style: TextStyle(color: Color(0xFF16A34A), fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildTrustGauge('Laporan Keuangan Dipublikasi', 1.0),
                        const SizedBox(height: 12),
                        _buildTrustGauge('Keputusan Terdokumentasi', 0.92),
                        const SizedBox(height: 12),
                        _buildTrustGauge('Tingkat Kehadiran RAT', 0.78),
                        const SizedBox(height: 12),
                        _buildTrustGauge('Respons Pengaduan', 0.85),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 3. Digital Voting Card
                Row(
                  children: const [
                    Icon(Icons.how_to_vote, color: Color(0xFF3B82F6), size: 24),
                    SizedBox(width: 8),
                    Text('Voting Digital (E-RAT)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8)),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Align(
                          alignment: Alignment.center,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text(
                              'Sidang Paripurna - Agenda 3',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Apakah Anda menyetujui program pengadaan traktor desa untuk tahun 2026 dengan anggaran Rp 120 Juta?',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white, height: 1.4),
                        ),
                        const SizedBox(height: 28),
                        if (voteSelection != null)
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
                            ),
                            padding: const EdgeInsets.all(16),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 28),
                                const SizedBox(width: 12),
                                Flexible(
                                  child: Text(
                                    'Pilihan Anda tersimpan:\n$voteSelection',
                                    textAlign: TextAlign.left,
                                    style: const TextStyle(color: Color(0xFF16A34A), fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _showVoteConfirmation(context, 'Setuju'),
                                  icon: const Icon(Icons.thumb_up, size: 16, color: Color(0xFF15803D)),
                                  label: const Text('Setuju', style: TextStyle(color: Color(0xFF15803D), fontSize: 14, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: const Color(0xFF15803D),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    elevation: 4,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _showVoteConfirmation(context, 'Tidak Setuju'),
                                  icon: const Icon(Icons.thumb_down, size: 16, color: Color(0xFFB91C1C)),
                                  label: const Text('Tolak', style: TextStyle(color: Color(0xFFB91C1C), fontSize: 14, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: const Color(0xFFB91C1C),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    elevation: 4,
                                  ),
                                ),
                              )
                            ],
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 4. Decision Timeline Section
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF718096),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Linimasa Keputusan',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      _buildTimelineItem('Persetujuan program digitalisasi UMKM senilai Rp 50jt 12 Jun 2025', 'Sedang berjalan', const Color(0xFFFEF3C7), const Color(0xFF92400E)),
                      const SizedBox(height: 12),
                      _buildTimelineItem('Penetapan bunga simpanan 6% per tahun periode 2026', 'Disetujui', const Color(0xFFDCFCE7), const Color(0xFF166534)),
                      const SizedBox(height: 12),
                      _buildTimelineItem('Rencana penarikan admin simpanan minimarket per Juli 2026', 'Tidak Disetujui', const Color(0xFFFEE2E2), const Color(0xFF991B1B)),
                    ],
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

  Widget _buildWhiteStatCard(String label, String val, String subText, {bool italic = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 6,
            offset: Offset(0, 2),
          )
        ],
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(
            val,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 2),
          Text(
            subText,
            style: TextStyle(
              fontSize: 8,
              color: italic ? Colors.grey : const Color(0xFF16A34A),
              fontWeight: FontWeight.bold,
              fontStyle: italic ? FontStyle.italic : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustGauge(String label, double fillRate) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            Text('${(fillRate * 100).toInt()}%', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.orange)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: fillRate,
            minHeight: 6,
            backgroundColor: const Color(0xFFCBD5E1),
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF64748B)),
          ),
        )
      ],
    );
  }

  Widget _buildTimelineItem(String text, String badge, Color bgBadge, Color textBadge) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            text,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: bgBadge,
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            child: Text(
              badge,
              style: TextStyle(color: textBadge, fontSize: 8, fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
    );
  }

  void _showVoteConfirmation(BuildContext context, String choice) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          title: Row(
            children: [
              Icon(choice == 'Setuju' ? Icons.info_outline : Icons.warning_amber_rounded, 
                  color: choice == 'Setuju' ? const Color(0xFF3B82F6) : const Color(0xFFF59E0B), size: 28),
              const SizedBox(width: 8),
              const Text('Konfirmasi Voting', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
            ],
          ),
          content: Text(
            'Apakah Anda yakin ingin memberikan suara "$choice" pada agenda pengadaan traktor desa 2026? Pilihan tidak dapat diubah setelah disimpan.',
            style: const TextStyle(color: Color(0xFF475569), fontSize: 14, height: 1.4),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                onVote(choice);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: choice == 'Setuju' ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Ya, Konfirmasi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}

// ----------------- SCREEN 5: PROFILE VIEW -----------------
class ProfileView extends StatelessWidget {
  final int streak;
  final VoidCallback onLogout;
  final List<dynamic> listSavings;
  final List<dynamic> listLoans;

  const ProfileView({
    super.key,
    required this.streak,
    required this.onLogout,
    required this.listSavings,
    required this.listLoans,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Profile
          Container(
            color: const Color(0xFF0F172A),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 24),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 106,
                      height: 106,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF59E0B), Color(0xFFFCD34D)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF59E0B).withOpacity(0.5),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                    const CircleAvatar(
                      radius: 48,
                      backgroundColor: Color(0xFF0F172A),
                      child: CircleAvatar(
                        radius: 44,
                        backgroundColor: Colors.white70,
                        child: Text('AS', style: TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFF59E0B), Color(0xFFB45309)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.workspace_premium, color: Colors.white, size: 14),
                            SizedBox(width: 4),
                            Text(
                              'RANK EMAS',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Agung',
                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Anggota Premium Koperasi',
                  style: TextStyle(color: Color(0xFFFCD34D), fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                const Text(
                  'No. Anggota: KMP-DSKMJ -2021-0041',
                  style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                
                // Badges
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTopBadge(Icons.local_fire_department, '$streak Hari Streak', Colors.white, Colors.white12, iconColor: Colors.orange),
                    const SizedBox(width: 8),
                    _buildTopBadge(Icons.calendar_month, 'Aktif 2021', Colors.white, Colors.white12),
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
                // 1. Membership QR Card
                Card(
                  color: const Color(0xFF111827),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          color: Colors.white,
                          padding: const EdgeInsets.all(6),
                          child: const Icon(Icons.qr_code, color: Colors.black, size: 52),
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'QR Kartu Keanggotaan',
                                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Untuk transaksi, presensi RAT, dan verifikasi identitas',
                                style: TextStyle(color: Colors.grey, fontSize: 9.5),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Ranking
                const Text('Ranking', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF1C2533),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildRankItem(Icons.eco, 'Perunggu', Colors.greenAccent, false),
                              _buildRankDivider(),
                              _buildRankItem(Icons.military_tech, 'Perak', Colors.amberAccent, false),
                              _buildRankDivider(),
                              _buildRankItem(Icons.workspace_premium, 'Emas', const Color(0xFFF59E0B), true),
                              _buildRankDivider(),
                              _buildRankItem(Icons.diamond, 'Platinum', Colors.lightBlue, false, opacity: 0.5),
                              _buildRankDivider(),
                              _buildRankItem(Icons.grade, 'Legenda', Colors.redAccent, false, opacity: 0.5),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: Colors.white10),
                        const SizedBox(height: 8),
                        const Text(
                          'Tingkatkan Ranking untuk limit pinjaman lebih tinggi + hadiah eksklusif!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 10, height: 1.4),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Achievements
                const Text('Penghargaan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                SizedBox(
                  height: 120,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildAchievementIcon('Investor Desa', 'Tabung Rp 5Jt', Icons.savings),
                      const SizedBox(width: 12),
                      _buildAchievementIcon('Loyal Streak', '30 Hari Beruntun', Icons.local_fire_department, opacity: 0.8),
                      const SizedBox(width: 12),
                      _buildAchievementIcon('UMKM Hero', '100 Produk Terjual', Icons.storefront, opacity: 0.8),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 2. Personal Impact Section
                const Text('Dampak Personal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                  children: [
                    _buildImpactCard('Total Transaksi', '247'),
                    _buildImpactCard('Estimasi SHU', 'Rp 320rb'),
                    _buildImpactCard('UMKM Didukung', '18'),
                    _buildImpactCard('Tingkat Kemenangan', '73 %'),
                  ],
                ),
                const SizedBox(height: 20),

                // Mutasi & Ledger Keuangan
                const Text('Mutasi & Ledger Keuangan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (listSavings.isEmpty && listLoans.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Text(
                              'Belum ada transaksi tercatat.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          )
                        else ...[
                          if (listSavings.isNotEmpty) ...[
                            const Text(
                              'Simpanan & Penarikan',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                            ),
                            const SizedBox(height: 8),
                            ...listSavings.map((s) {
                              final bool isDeposit = s['type'] == 'deposit';
                              final int amount = s['amount'] ?? 0;
                              final String desc = s['description'] ?? 'Transaksi Simpanan';
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(desc, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                          Text(
                                            s['transactionDate'] != null ? s['transactionDate'].toString().split('T')[0] : '',
                                            style: const TextStyle(fontSize: 9, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${isDeposit ? "+" : "-"} Rp ${amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: isDeposit ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(height: 12),
                          ],
                          if (listLoans.isNotEmpty) ...[
                            const Divider(height: 1),
                            const SizedBox(height: 12),
                            const Text(
                              'Status Pinjaman',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                            ),
                            const SizedBox(height: 8),
                            ...listLoans.map((l) {
                              final int amount = l['amount'] ?? 0;
                              final String status = l['status'] ?? 'pending';
                              final Color statusColor = status == 'approved'
                                  ? const Color(0xFF3B82F6)
                                  : status == 'paid'
                                      ? const Color(0xFF16A34A)
                                      : const Color(0xFFF59E0B);
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Pinjaman Dana', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        const SizedBox(height: 4),
                                        Container(
                                          decoration: BoxDecoration(
                                            color: statusColor.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          child: Text(
                                            status.toUpperCase(),
                                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor),
                                          ),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      'Rp ${amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // 3. Settings List
                const Text('Pengaturan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF718096),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Column(
                    children: [
                      _buildSettingsTile('Edit Profil'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Ganti PIN'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Notifikasi'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Bahasa'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Pusat Bantuan'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Logout Button
                ElevatedButton(
                  onPressed: onLogout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Keluar',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
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

  Widget _buildTopBadge(IconData icon, String text, Color textCol, Color bgCol, {Color? iconColor}) {
    return Container(
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(20),
        border: bgCol == Colors.white12 ? Border.all(color: Colors.white10) : null,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor ?? textCol, size: 12),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(color: textCol, fontSize: 9, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildImpactCard(String label, String value) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9).withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(String title) {
    return ListTile(
      title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      trailing: const Icon(Icons.chevron_right, color: Colors.white70),
      onTap: () {},
    );
  }

  Widget _buildRankItem(IconData icon, String title, Color color, bool isActive, {double opacity = 1.0}) {
    return Opacity(
      opacity: opacity,
      child: Column(
        children: [
          Container(
            width: isActive ? 52 : 46,
            height: isActive ? 52 : 46,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(isActive ? 12 : 24),
              border: isActive ? Border.all(color: const Color(0xFFFACC15), width: 2) : Border.all(color: Colors.white10),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: const Color(0xFFFACC15).withOpacity(0.3),
                        blurRadius: 15,
                      )
                    ]
                  : null,
            ),
            child: Icon(icon, color: isActive ? const Color(0xFFFBBF24) : color, size: isActive ? 28 : 22),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(
              fontSize: 8,
              color: isActive ? const Color(0xFFFACC15) : Colors.white60,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildRankDivider() {
    return Container(
      width: 24,
      height: 1.5,
      color: Colors.white10,
      margin: const EdgeInsets.symmetric(horizontal: 6),
    );
  }

  Widget _buildAchievementIcon(String title, String desc, IconData icon, {double opacity = 1.0}) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: 128,
        decoration: BoxDecoration(
          color: const Color(0xFF718096),
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 36),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            Text(
              desc,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70, fontSize: 8),
            ),
          ],
        ),
      ),
    );
  }
}
