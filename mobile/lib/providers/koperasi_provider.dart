import 'package:flutter/material.dart';
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
  int xp = 0;
  int streak = 0;
  int userWinRate = 0;
  int totalBattles = 0;
  int level = 1;
  String rankName = 'Perunggu';
  String nextRankName = 'Perak';
  int nextLevelPoints = 1000;
  String? voteSelection;
  bool isLoading = true;
  int walletBalance = 0;

  // Savings breakdown
  int simpananPokok = 0;
  int simpananWajib = 0;
  int simpananSukarela = 0;
  int totalSimpanan = 0;
  List<dynamic> listSavings = [];
  List<dynamic> listLoans = [];
  List<dynamic> listDues = [];
  List<dynamic> listWalletTxs = [];
  Map<String, dynamic>? activeBattle;
  String? activeBattleEndDate;

  // Membership status states
  bool isMemberActive = true;
  bool isPokokPaid = true;
  bool isWajibPaidThisMonth = true;
  int pendingWajibAmount = 0;

  // Koperasi Stats
  int kopTransaksi = 0;
  int kopAnggotaBaru = 0;
  int kopOmzet = 0;
  int kopUmkm = 0;

  // Governance
  List<dynamic> activeProposals = [];
  List<dynamic> pastProposals = [];
  int totalMembers = 0;
  int totalAsetDesa = 0;
  int asetKas = 0;
  int asetPinjaman = 0;
  int asetInvestasi = 0;
  bool canSubmitProposal = false;

  // Badges
  List<dynamic> earnedBadges = [];

  // Weekly streak (computed dynamically from DB lastActivityDate)
  Map<String, bool> weeklyStreakDays = {
    'Sen': false, 'Sel': false, 'Rab': false, 'Kam': false,
    'Jum': false, 'Sab': false, 'Min': false,
  };

  // Missions
  List<Mission> missions = [];

  // Shop Items (DB-backed)
  List<ShopItem> shopItems = [];

  // Inventory (DB-backed)
  List<InventoryItem> inventory = [];

  // Leaderboard (DB-backed)
  List<dynamic> leaderboard = [];

  // Point transactions (DB-backed)
  List<dynamic> pointTransactions = [];

  // Match History
  List<HistoryItem> historyList = [];

  KoperasiProvider() {
    loadSavedSession();
  }

  String _apiUrl(String path) {
    return 'http://localhost:3000$path';
  }

  Map<String, String> _headers({bool isJson = false}) {
    final h = <String, String>{
      if (token != null) 'Authorization': 'Bearer $token',
    };
    if (isJson) {
      h['Content-Type'] = 'application/json';
    }
    return h;
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
      final response = await http.post(
        Uri.parse(_apiUrl('/api/auth/login')),
        headers: _headers(isJson: true),
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
      final response = await http.post(
        Uri.parse(_apiUrl('/api/auth/signup')),
        headers: _headers(isJson: true),
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
        return res['success'] == true;
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

  Future<void> fetchData() async {
    try {
      isLoading = true;
      notifyListeners();

      final response = await http.get(
        Uri.parse(_apiUrl('/api/mobile-sync')),
        headers: _headers(),
      );
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['success']) {
          final data = jsonResponse['data'];

          final progress = data['dashboard']?['progress'];
          if (progress != null) {
            points = (progress['pointsBalance'] as num?)?.toInt() ?? points;
            xp = (progress['xp'] as num?)?.toInt() ?? xp;
            streak = (progress['currentStreak'] as num?)?.toInt() ?? streak;
            level = (progress['level'] as num?)?.toInt() ?? level;
            walletBalance = (progress['walletBalance'] as num?)?.toInt() ?? walletBalance;
            _recomputeRank();
            _computeWeeklyStreak(progress['lastActivityDate']);
          }

          pointTransactions =
              data['dashboard']?['transactions'] as List<dynamic>? ?? [];

          final financials = data['financials'];
          if (financials != null) {
            simpananPokok = (financials['simpananPokok'] as num?)?.toInt() ?? 0;
            simpananWajib = (financials['simpananWajib'] as num?)?.toInt() ?? 0;
            simpananSukarela = (financials['simpananSukarela'] as num?)?.toInt() ?? 0;
            totalSimpanan = (financials['totalSavings'] as num?)?.toInt() ?? 0;
            listSavings = financials['savings'] ?? [];
            listLoans = financials['loans'] ?? [];
            listDues = financials['dues'] ?? [];
            listWalletTxs = financials['walletTransactions'] ?? [];

            isMemberActive = financials['isMemberActive'] ?? true;
            isPokokPaid = financials['isPokokPaid'] ?? true;
            isWajibPaidThisMonth = financials['isWajibPaidThisMonth'] ?? true;
            pendingWajibAmount = (financials['pendingWajibAmount'] as num?)?.toInt() ?? 0;
          }

          final quests = data['quests'];
          if (quests != null && quests is List) {
            missions = quests.map<Mission>((q) {
              final p = q['progress'];
              return Mission(
                id: q['id'].toString(),
                title: q['title'] ?? '',
                description: q['description'] ?? '',
                points: (q['rewardPoints'] as num?)?.toInt() ?? 0,
                targetCount: (q['targetCount'] as num?)?.toInt() ?? 1,
                progress: (p?['progress'] as num?)?.toInt() ?? 0,
                isCompleted: p?['isCompleted'] ?? false,
                isDaily: (q['frequency'] ?? q['category']) == 'daily',
              );
            }).toList();
          }

          final kopStats = data['koperasiStats'];
          if (kopStats != null) {
            kopTransaksi = (kopStats['transaksi'] as num?)?.toInt() ?? 0;
            kopAnggotaBaru = (kopStats['anggotaBaru'] as num?)?.toInt() ?? 0;
            kopOmzet = (kopStats['omzetHarian'] as num?)?.toInt() ?? 0;
            kopUmkm = (kopStats['umkmAktif'] as num?)?.toInt() ?? 0;
          }

          final arena = data['arena'];
          if (arena != null) {
            if (arena['activeBattles'] != null &&
                (arena['activeBattles'] as List).isNotEmpty) {
              activeBattle = arena['activeBattles'][0];
              activeBattleEndDate =
                  activeBattle?['endDate']?.toString().split('T')[0];
            }
            final past = arena['pastBattles'];
            if (past != null && past is List) {
              historyList = past.map<HistoryItem>((b) {
                final isWinner = b['winnerId'] == memberId;
                final opName = b['opponent']?['namaLengkap'] ?? 'Lawan';
                final myScore = b['challengerId'] == memberId
                    ? b['challengerPoints']
                    : b['opponentPoints'];
                return HistoryItem(
                  opponent: opName,
                  result: isWinner ? 'Menang' : 'Kalah',
                  points: (myScore as num?)?.toInt() ?? 0,
                  date: b['endDate']?.toString().split('T')[0],
                );
              }).toList();
            }
          }

          final governance = data['governance'];
          if (governance != null) {
            activeProposals = governance['activeProposals'] ?? [];
            pastProposals = governance['pastProposals'] ?? [];
            totalMembers = (governance['totalMembers'] as num?)?.toInt() ?? 0;
            totalAsetDesa =
                (governance['totalAsetDesa'] as num?)?.toInt() ?? 0;
            asetKas = (governance['asetKas'] as num?)?.toInt() ?? 0;
            asetPinjaman = (governance['asetPinjaman'] as num?)?.toInt() ?? 0;
            asetInvestasi = (governance['asetInvestasi'] as num?)?.toInt() ?? 0;
            canSubmitProposal = level >= 20;
          }

          final badgesList = data['badges'];
          if (badgesList != null && badgesList is List) {
            earnedBadges = badgesList;
          }

          final wr = data['winRate'];
          if (wr != null) {
            userWinRate = ((wr['winRate'] as num?)?.toDouble() ?? 0).round();
            totalBattles = (wr['totalBattles'] as num?)?.toInt() ?? 0;
          }

          final storeItemsData = data['storeItems'];
          if (storeItemsData != null && storeItemsData is List) {
            shopItems = storeItemsData
                .map<ShopItem>((s) => ShopItem.fromJson(s))
                .toList();
          }

          final leaderboardData = data['leaderboard'];
          if (leaderboardData != null && leaderboardData is List) {
            leaderboard = leaderboardData;
          }

          final inventoryData = data['inventory'];
          if (inventoryData != null && inventoryData is List) {
            inventory = inventoryData
                .map<InventoryItem>((i) => InventoryItem.fromJson(i))
                .toList();
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

  void _recomputeRank() {
    nextLevelPoints = level * 1000;
    if (level >= 40) {
      rankName = 'Legenda';
      nextRankName = 'Legenda';
    } else if (level >= 30) {
      rankName = 'Platinum';
      nextRankName = 'Legenda';
    } else if (level >= 20) {
      rankName = 'Emas';
      nextRankName = 'Platinum';
    } else if (level >= 10) {
      rankName = 'Perak';
      nextRankName = 'Emas';
    } else {
      rankName = 'Perunggu';
      nextRankName = 'Perak';
    }
  }

  void _computeWeeklyStreak(String? lastActivityStr) {
    if (lastActivityStr == null) return;
    try {
      final lastActivity = DateTime.parse(lastActivityStr);
      final dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      final newStreak = <String, bool>{
        for (final k in dayLabels) k: false
      };
      final streakCount = streak.clamp(0, 7);
      for (int i = 0; i < streakCount; i++) {
        final day = lastActivity.subtract(Duration(days: i));
        final idx = day.weekday - 1;
        if (idx >= 0 && idx < 7) newStreak[dayLabels[idx]] = true;
      }
      weeklyStreakDays = newStreak;
    } catch (_) {}
  }

  Future<String> claimMission(String id, int? questRewardPoints) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'toggle-quest',
          'memberId': memberId,
          'questId': int.parse(id),
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        await fetchData();
        final reward = questRewardPoints ?? 0;
        return 'Misi selesai! +$reward Poin';
      }
      return body['error'] ?? 'Gagal klaim misi (mungkin belum selesai).';
    } catch (e) {
      print('Claim mission error: $e');
      return 'Gagal menyimpan ke server.';
    }
  }

  Future<String> buyShopItem(ShopItem item) async {
    if (points < item.cost) {
      return 'Poin tidak mencukupi untuk membeli ${item.title}';
    }
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'buy-item',
          'memberId': memberId,
          'itemId': item.id,
          'cost': item.cost,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        points = (body['updatedPoints'] as num?)?.toInt() ?? points;
        await fetchData();
        return 'Berhasil membeli ${item.title}! -${item.cost} Poin';
      }
      return body['error'] ?? 'Gagal memproses pembelian.';
    } catch (e) {
      print('Buy item error: $e');
      return 'Gagal memproses pembelian di server.';
    }
  }

  Future<String> useInventoryItem(int itemId, {int? targetMemberId}) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'use-item',
          'memberId': memberId,
          'itemId': itemId,
          if (targetMemberId != null) 'targetMemberId': targetMemberId,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        await fetchData();
        return 'Item digunakan!';
      }
      return body['error'] ?? 'Gagal menggunakan item.';
    } catch (e) {
      print('Use item error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> submitVote(String choice) async {
    final proposal =
        activeProposals.isNotEmpty ? activeProposals[0] : null;
    final proposalId = proposal?['id'] ?? 1;
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'vote',
          'memberId': memberId,
          'proposalId': proposalId,
          'voteType': choice,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        voteSelection = choice;
        notifyListeners();
        return 'Terima kasih! Pilihan Anda ($choice) disimpan.';
      }
      return body['error'] ?? 'Gagal mengirim voting ke server.';
    } catch (e) {
      print('Vote error: $e');
      return 'Gagal mengirim voting ke server.';
    }
  }

  Future<String> submitProposal(String title, String description) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'submit-proposal',
          'memberId': memberId,
          'title': title,
          'description': description,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        await fetchData();
        return 'Proposal berhasil diajukan!';
      }
      return body['error'] ?? 'Gagal mengajukan proposal.';
    } catch (e) {
      print('Submit proposal error: $e');
      return 'Gagal mengajukan proposal.';
    }
  }

  Future<Map<String, dynamic>> createTopUp(int amount) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'create-topup',
          'memberId': memberId,
          'amount': amount,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        return {
          'success': true,
          'invoiceId': body['invoiceId'],
          'invoiceUrl': body['invoiceUrl'],
        };
      }
      return {'success': false, 'error': body['error'] ?? 'Gagal membuat invoice.'};
    } catch (e) {
      print('Create topup error: $e');
      return {'success': false, 'error': 'Gagal menghubungi server.'};
    }
  }

  Future<Map<String, dynamic>> verifyTopUp(String invoiceId) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'verify-topup',
          'memberId': memberId,
          'invoiceId': invoiceId,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        if (body['status'] == 'paid') {
          await fetchData();
          return {'success': true, 'status': 'paid'};
        }
        return {'success': true, 'status': 'pending'};
      }
      return {'success': false, 'error': body['error'] ?? 'Gagal verifikasi.'};
    } catch (e) {
      print('Verify topup error: $e');
      return {'success': false, 'error': 'Gagal menghubungi server.'};
    }
  }

  Future<String> payDuesFromWallet(String type) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'pay-dues-wallet',
          'memberId': memberId,
          'type': type,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error'] ?? 'Gagal membayar iuran.';
    } catch (e) {
      print('Pay dues wallet error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> depositSavingsFromWallet(int amount, String description) async {
    try {
      final res = await http.post(
        Uri.parse(_apiUrl('/api/mobile-sync/action')),
        headers: _headers(isJson: true),
        body: json.encode({
          'action': 'deposit-savings-wallet',
          'memberId': memberId,
          'amount': amount,
          'description': description,
        }),
      );
      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error'] ?? 'Gagal menabung.';
    } catch (e) {
      print('Deposit savings wallet error: $e');
      return 'Gagal menghubungi server.';
    }
  }
}