import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/mission.dart';
import '../models/shop_item.dart';
import '../models/history_item.dart';

class KoperasiProvider extends ChangeNotifier {
  // Auth State
  String? token;
  int? memberId;
  String? email;
  String? fullName;
  bool isLoggedIn = false;

  // Global State
  int points = 0;
  int streak = 0;
  int userWinRate = 50;
  int level = 1;
  String rankName = 'Perunggu';
  String? voteSelection;
  bool isLoading = true;

  // Savings breakdown
  int simpananPokok = 0;
  int simpananWajib = 0;
  int simpananSukarela = 0;
  List<dynamic> listSavings = [];
  List<dynamic> listLoans = [];
  Map<String, dynamic>? activeBattle;
  String? activeBattleEndDate;

  // Koperasi Stats
  int kopTransaksi = 0;
  int kopAnggotaBaru = 0;
  int kopOmzet = 0;
  int kopUmkm = 0;

  // Governance
  List<dynamic> activeProposals = [];

  // Badges
  List<dynamic> earnedBadges = [];

  // Weekly streak (computed dynamically)
  Map<String, bool> weeklyStreakDays = {
    'Sen': false, 'Sel': false, 'Rab': false, 'Kam': false,
    'Jum': false, 'Sab': false, 'Min': false,
  };

  // Missions
  List<Mission> missions = [];

  // Shop Items
  List<ShopItem> shopItems = [];

  // Match History
  List<HistoryItem> historyList = [];

  KoperasiProvider() {
    _initMissions();
    _initShopItems();
    loadSavedSession();
  }

  Future<void> loadSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString('auth_token');
      memberId = prefs.getInt('member_id');
      email = prefs.getString('email');
      fullName = prefs.getString('full_name');
      if (token != null) {
        isLoggedIn = true;
        fetchData();
      } else {
        isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      print('Load session error: $e');
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String emailInput, String passwordInput) async {
    try {
      String apiHost = 'localhost:3000';
      if (Uri.base.host.isNotEmpty) {
        apiHost = '${Uri.base.host}:3000';
      }
      final response = await http.post(
        Uri.parse('http://$apiHost/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': emailInput, 'password': passwordInput}),
      );
      if (response.statusCode == 200) {
        final res = json.decode(response.body);
        if (res['success']) {
          token = res['token'];
          memberId = res['memberId'];
          email = res['email'];
          fullName = res['fullName'];
          isLoggedIn = true;

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token!);
          await prefs.setInt('member_id', memberId!);
          await prefs.setString('email', email!);
          await prefs.setString('full_name', fullName!);

          await fetchData();
          return true;
        }
      }
    } catch (e) {
      print('Login error: $e');
    }
    return false;
  }

  Future<bool> signup({
    required String email,
    required String password,
    required String nik,
    required String fullName,
    String provinsi = '',
    String kabupaten = '',
    String kecamatan = '',
    String desa = '',
    required String koperasi,
  }) async {
    try {
      String apiHost = 'localhost:3000';
      if (Uri.base.host.isNotEmpty) {
        apiHost = '${Uri.base.host}:3000';
      }
      final response = await http.post(
        Uri.parse('http://$apiHost/api/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
          'nik': nik,
          'namaLengkap': fullName,
          'provinsi': provinsi,
          'kabupaten': kabupaten,
          'kecamatan': kecamatan,
          'desa': desa,
          'koperasi': koperasi,
        }),
      );
      if (response.statusCode == 200) {
        final res = json.decode(response.body);
        return res['success'];
      }
    } catch (e) {
      print('Signup error: $e');
    }
    return false;
  }

  Future<void> logout() async {
    token = null;
    memberId = null;
    email = null;
    fullName = null;
    isLoggedIn = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('member_id');
    await prefs.remove('email');
    await prefs.remove('full_name');

    notifyListeners();
  }

  void _initMissions() {
    missions = [
      Mission(id: 'd1', title: 'Belanja hari ini', points: 20, completed: true, isDaily: true),
      Mission(id: 'd2', title: 'Hadir RAT', points: 50, completed: false, isDaily: true),
      Mission(id: 'd3', title: 'Baca berita koperasi', points: 15, completed: false, isDaily: true),
      Mission(id: 'd4', title: 'Isi Survey Anggota', points: 15, completed: false, isDaily: true),
      Mission(id: 'w1', title: 'Hadiri rapat tahunan', points: 120, completed: false, isDaily: false),
      Mission(id: 'w2', title: 'Ajak Anggota baru', points: 200, completed: false, isDaily: false),
    ];
  }

  void _initShopItems() {
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
  }

  Future<void> fetchData() async {
    try {
      isLoading = true;
      notifyListeners();

      String apiHost = 'localhost:3000';
      if (Uri.base.host.isNotEmpty) {
        apiHost = '${Uri.base.host}:3000';
      }
      final response = await http.get(
        Uri.parse('http://$apiHost/api/mobile-sync'),
        headers: {if (token != null) 'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['success']) {
          final data = jsonResponse['data'];
          
          final progress = data['dashboard']?['progress'];
          if (progress != null) {
            points = progress['pointsBalance'] ?? points;
            streak = progress['currentStreak'] ?? streak;
            level = progress['level'] ?? level;
            rankName = _rankFromLevel(level);

            // Compute weekly streak days from lastActivityDate + currentStreak
            final lastActivityStr = progress['lastActivityDate'];
            if (lastActivityStr != null) {
              try {
                final lastActivity = DateTime.parse(lastActivityStr);
                final today = DateTime.now();
                final dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                final newStreak = <String, bool>{};
                for (final key in dayLabels) { newStreak[key] = false; }
                // Fill backward from lastActivity for streak days
                final streakCount = streak.clamp(0, 7);
                for (int i = 0; i < streakCount; i++) {
                  final day = lastActivity.subtract(Duration(days: i));
                  // weekday: 1=Mon..7=Sun
                  final idx = day.weekday - 1; // 0-indexed
                  newStreak[dayLabels[idx]] = true;
                }
                weeklyStreakDays = newStreak;
              } catch (_) {}
            }
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
          if (arena != null) {
            if (arena['activeBattles'] != null && (arena['activeBattles'] as List).isNotEmpty) {
              activeBattle = arena['activeBattles'][0];
              activeBattleEndDate = activeBattle?['endDate']?.toString().split('T')[0];
              // Compute win rate from scores
              final challengerId = activeBattle?['challengerId'];
              final challengerPts = (activeBattle?['challengerPoints'] ?? 0) as int;
              final opponentPts = (activeBattle?['opponentPoints'] ?? 0) as int;
              final myScore = challengerId == memberId ? challengerPts : opponentPts;
              final opScore = challengerId == memberId ? opponentPts : challengerPts;
              final totalScore = myScore + opScore;
              userWinRate = totalScore > 0 ? ((myScore / totalScore) * 100).round() : 50;
            }
            final past = arena['pastBattles'];
            if (past != null && past is List) {
              historyList = past.map<HistoryItem>((b) {
                final isWinner = b['winnerId'] == memberId;
                final opName = b['opponent']?['namaLengkap'] ?? 'Lawan';
                final myScore = b['challengerId'] == memberId ? b['challengerPoints'] : b['opponentPoints'];
                return HistoryItem(
                  opponent: opName,
                  result: isWinner ? 'Menang' : 'Kalah',
                  points: myScore ?? 0,
                );
              }).toList();
            }
          }

          final governance = data['governance'];
          if (governance != null) {
            activeProposals = governance['activeProposals'] ?? [];
          }

          final badgesList = data['badges'];
          if (badgesList != null && badgesList is List) {
            earnedBadges = badgesList;
          }

          final winRateData = data['winRate'];
          if (winRateData != null) {
            userWinRate = (winRateData['winRate'] as num?)?.round() ?? userWinRate;
          }
        }
      }
    } catch (e) {
      print('Fetch err: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String _rankFromLevel(int lvl) {
    if (lvl >= 15) return 'Legenda';
    if (lvl >= 10) return 'Platinum';
    if (lvl >= 6) return 'Emas';
    if (lvl >= 3) return 'Perak';
    return 'Perunggu';
  }

  Future<void> toggleMission(String id, Function(String) showSnackBar) async {
    for (var m in missions) {
      if (m.id == id) {
        // Optimistic UI update
        m.completed = !m.completed;
        if (m.completed) {
          points += m.points;
          showSnackBar('Misi "${m.title}" selesai! +${m.points} Poin');
        } else {
          points -= m.points;
          showSnackBar('Batal menyelesaikan "${m.title}". Poin -${m.points}');
        }
        notifyListeners();

        // Server update
        try {
          String apiHost = 'localhost:3000';
          if (Uri.base.host.isNotEmpty) {
            apiHost = '${Uri.base.host}:3000';
          }
          final res = await http.post(
            Uri.parse('http://$apiHost/api/mobile-sync/action'),
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token'
            },
            body: json.encode({
              'action': 'toggle-quest',
              'memberId': 1,
              'questId': int.parse(id),
            }),
          );
          if (res.statusCode != 200 || !json.decode(res.body)['success']) {
            throw Exception('Server error');
          }
        } catch (e) {
          print('Toggle quest sync error: $e');
          // Rollback on failure
          m.completed = !m.completed;
          if (m.completed) {
            points += m.points;
          } else {
            points -= m.points;
          }
          showSnackBar('Gagal menyimpan status misi ke server.');
          notifyListeners();
        }
        break;
      }
    }
  }

  Future<void> buyShopItem(ShopItem item, Function(String) showSnackBar) async {
    if (points >= item.cost) {
      // Optimistic UI update
      points -= item.cost;
      item.ownedCount += 1;
      showSnackBar('Berhasil membeli ${item.title}! -${item.cost} Poin');
      notifyListeners();

      // Server update
      try {
        String apiHost = 'localhost:3000';
        if (Uri.base.host.isNotEmpty) {
          apiHost = '${Uri.base.host}:3000';
        }
        final res = await http.post(
          Uri.parse('http://$apiHost/api/mobile-sync/action'),
          headers: {
            'Content-Type': 'application/json',
            if (token != null) 'Authorization': 'Bearer $token'
          },
          body: json.encode({
            'action': 'buy-item',
            'memberId': 1,
            'itemId': item.id,
            'cost': item.cost,
          }),
        );
        if (res.statusCode != 200 || !json.decode(res.body)['success']) {
          throw Exception('Server error');
        }
      } catch (e) {
        print('Buy item sync error: $e');
        // Rollback on failure
        points += item.cost;
        item.ownedCount -= 1;
        showSnackBar('Gagal memproses pembelian di server.');
        notifyListeners();
      }
    } else {
      showSnackBar('Poin tidak mencukupi untuk membeli ${item.title}');
    }
  }

  void useItemInBattle(ShopItem item, Function(String) showSnackBar) {
    if (item.ownedCount > 0) {
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
      showSnackBar(log);
      notifyListeners();
    } else {
      showSnackBar('Kamu tidak memiliki item ini. Beli di Toko Misi.');
    }
  }

  Future<void> submitVote(String choice, Function(String) showSnackBar) async {
    // Optimistic UI update
    final oldSelection = voteSelection;
    voteSelection = choice;
    showSnackBar('Terima kasih! Pilihan Anda ($choice) disimpan.');
    notifyListeners();

    // Server update
    try {
      String apiHost = 'localhost:3000';
      if (Uri.base.host.isNotEmpty) {
        apiHost = '${Uri.base.host}:3000';
      }
      final res = await http.post(
        Uri.parse('http://$apiHost/api/mobile-sync/action'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token'
        },
        body: json.encode({
          'action': 'vote',
          'memberId': 1,
          'proposalId': 1,
          'voteType': choice,
        }),
      );
      if (res.statusCode != 200 || !json.decode(res.body)['success']) {
        throw Exception('Server error');
      }
    } catch (e) {
      print('Vote sync error: $e');
      // Rollback on failure
      voteSelection = oldSelection;
      showSnackBar('Gagal mengirim voting ke server.');
      notifyListeners();
    }
  }
}
