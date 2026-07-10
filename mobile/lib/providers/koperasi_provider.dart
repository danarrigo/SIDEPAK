import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/mission.dart';
import '../models/shop_item.dart';
import '../models/history_item.dart';
import '../models/marketplace_item.dart';
import '../models/event_model.dart';

class KoperasiProvider extends ChangeNotifier {
  // Test hook: allow tests to inject a custom http.Client.
  // ignore: unused_field
  static http.Client? apiClientOverride;

  http.Client get _client => apiClientOverride ?? http.Client();

  // Auth State
  String? token;
  int? memberId;
  String? email;
  String? fullName;
  String? role;
  bool isLoggedIn = false;

  // Global State
  Map<String, dynamic>? adminStats;
  int points = 0;
  int xp = 0;
  int streak = 0;
  int userWinRate = 0;
  int totalBattles = 0;
  int level = 1;
  String rankName = 'Perunggu';
  String nextRankName = 'Perak';
  int nextLevelPoints = 2500;
  int membershipScore = 0;
  int creditScore = 700;
  String? voteSelection;
  bool isLoading = true;
  int walletBalance = 0;
  String? activeEffect;
  String? provinsi;
  String? koperasiName;

  // Savings breakdown
  int simpananPokok = 0;
  int simpananWajib = 0;
  int simpananSukarela = 0;
  int totalSimpanan = 0;
  List<dynamic> listSavings = [];
  List<dynamic> listLoans = [];
  List<dynamic> listDues = [];
  List<dynamic> listWalletTxs = [];
  List<dynamic> listDisbursements = [];
  List<dynamic> listNotifications = [];
  String? phoneNumber;
  Map<String, dynamic>? activeBattle;
  String? activeBattleEndDate;
  Map<String, dynamic>? activeLoan;
  Map<String, dynamic>? myStats;
  Map<String, dynamic>? opStats;

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
  bool canSubmitEvent = false;

  // Badges
  List<dynamic> earnedBadges = [];

  // Weekly streak (computed dynamically from DB lastActivityDate)
  Map<String, bool> weeklyStreakDays = {
    'Sen': false,
    'Sel': false,
    'Rab': false,
    'Kam': false,
    'Jum': false,
    'Sab': false,
    'Min': false,
  };

  // Missions
  List<Mission> missions = [];
  List<int> claimedChests = [];

  // Shop Items (DB-backed)
  List<ShopItem> shopItems = [];

  // Inventory (DB-backed)
  List<InventoryItem> inventory = [];

  // Leaderboard (DB-backed) - legacy single scope
  List<dynamic> leaderboard = [];

  // Leaderboard by scope (Phase 3)
  List<dynamic> leaderboardByKoperasi = [];
  List<dynamic> leaderboardByProvinsi = [];
  List<dynamic> leaderboardByNasional = [];

  // Point transactions (DB-backed)
  List<dynamic> pointTransactions = [];

  // Match History
  List<HistoryItem> historyList = [];

  // Last fetch error (used by UI to show user-facing error message)
  String? lastFetchError;
  bool sessionExpired = false;

  // Marketplace P2P items (Phase 1)
  List<MarketplaceItem> marketplaceItems = [];

  // Events (Phase 2)
  List<EventModel> events = [];
  Set<int> joinedEventIds = {};

  // Active members directory (Phase 4a)
  List<dynamic> activeMembers = [];

  KoperasiProvider() {
    loadSavedSession();
  }

  String _apiUrl(String path) {
    // Vercel now serves the app under the new "SIDEPAK" name. The old
    // `hackathon-kopdes.vercel.app` URL is configured as a 307 redirect to
    // `sidepak.vercel.app`, which trips CORS preflight (browsers do not follow
    // redirects on OPTIONS requests — see "Redirect is not allowed for a
    // preflight request" error). Point directly at the new canonical host.
    return 'https://sidepak.vercel.app$path';
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

  Future<String?> createTopUpInvoice(int amount) async {
    final response = await _postAction({
      'action': 'create-topup',
      'amount': amount,
    });
    if (response['success'] == true) {
      return response['invoiceUrl'];
    }
    return null;
  }

  Future<String?> verifyAndPaySimpananPokok() async {
    final response = await _postAction({
      'action': 'verify-and-pay-simpanan-pokok',
    });
    if (response['success'] == true) {
      await fetchData();
      return null;
    }
    return response['error'] as String? ?? 'Gagal memverifikasi pembayaran';
  }

  /// POSTs an action to /api/mobile-sync/action and centralizes 401 handling.
  /// Returns the response body map on success, or `{success:false, error}` on
  /// failure. If the server returns 401/403, also triggers session-expiry
  /// handling so the user is logged out automatically.
  Future<Map<String, dynamic>> _postAction(Map<String, dynamic> body) async {
    final response = await _client.post(
      Uri.parse(_apiUrl('/api/mobile-sync/action')),
      headers: _headers(isJson: true),
      body: json.encode(body),
    );
    if (response.statusCode == 401 || response.statusCode == 403) {
      String msg = 'Sesi Anda telah berakhir. Silakan login ulang.';
      try {
        final body =
            response.body.isNotEmpty ? json.decode(response.body) : null;
        if (body is Map && body['error'] is String)
          msg = body['error'] as String;
      } catch (_) {}
      await _handleSessionExpired(msg);
      return {'success': false, 'error': msg, 'sessionExpired': true};
    }
    if (response.body.isEmpty) {
      return {'success': false, 'error': 'Empty server response'};
    }
    try {
      final parsed = json.decode(response.body);
      if (parsed is Map) return Map<String, dynamic>.from(parsed);
      return {'success': false, 'error': 'Invalid server response'};
    } catch (_) {
      return {'success': false, 'error': 'Failed to parse server response'};
    }
  }

  Future<void> loadSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString('auth_token');
      memberId = prefs.getInt('member_id');
      email = prefs.getString('email');
      fullName = prefs.getString('full_name');
      role = prefs.getString('role');
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

  /// Returns null on success, or a user-friendly Indonesian error message on failure.
  Future<String?> login(String emailInput, String passwordInput) async {
    try {
      final response = await _client.post(
        Uri.parse(_apiUrl('/api/auth/login')),
        headers: _headers(isJson: true),
        body: json.encode({'email': emailInput, 'password': passwordInput}),
      );
      if (response.statusCode == 200) {
        final res = json.decode(response.body);
        if (res is Map && res['success'] == true) {
          token = res['token'];
          memberId = res['memberId'];
          email = res['email'];
          fullName = res['fullName'];
          role = res['role'];
          isLoggedIn = true;
          sessionExpired = false;
          lastFetchError = null;

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token!);
          await prefs.setInt('member_id', memberId!);
          await prefs.setString('email', email!);
          await prefs.setString('full_name', fullName!);
          if (role != null) await prefs.setString('role', role!);

          await fetchData();
          return null;
        }
        // 200 OK but success:false — return the server's error message
        return _extractError(res, defaultMessage: 'Login gagal.');
      }
      if (response.statusCode == 400) {
        final res =
            response.body.isNotEmpty ? json.decode(response.body) : null;
        return _extractError(res, defaultMessage: 'Email atau password salah.');
      }
      if (response.statusCode >= 500) {
        return 'Server error (HTTP ${response.statusCode}). Coba lagi nanti.';
      }
      return _extractError(null,
          defaultMessage: 'Login gagal (HTTP ${response.statusCode}).');
    } catch (e) {
      print('Login error: $e');
      return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    }
  }

  String _extractError(dynamic jsonResponse, {required String defaultMessage}) {
    if (jsonResponse is Map && jsonResponse['error'] is String) {
      final raw = (jsonResponse['error'] as String).trim();
      // Supabase auth error messages are already descriptive enough to pass through
      return raw.isEmpty ? defaultMessage : raw;
    }
    return defaultMessage;
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
    required String pekerjaan,
    required String nomorHp,
  }) async {
    try {
      final response = await _client.post(
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
          'pekerjaan': pekerjaan,
          'nomorHp': nomorHp,
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
    role = null;
    isLoggedIn = false;
    sessionExpired = false;
    lastFetchError = null;
    activeEffect = null;
    activeLoan = null;
    adminStats = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('member_id');
    await prefs.remove('email');
    await prefs.remove('full_name');
    await prefs.remove('role');

    notifyListeners();
  }

  /// Force logout when server rejects the auth token. Sets [sessionExpired] so
  /// the UI can show a toast/snackbar explaining the user was signed out.
  /// Note: must be called AFTER any prior logout (or set fields after logout,
  /// since logout() resets them).
  Future<void> _handleSessionExpired(String message) async {
    isLoading = false;
    await logout();
    sessionExpired = true;
    lastFetchError = message;
    notifyListeners();
  }

  /// Called by LoginView after it surfaces the session-expired toast, so the
  /// sessionExpired flag can be cleared and a subsequent login does not show it.
  void clearSessionExpired() {
    if (sessionExpired) {
      sessionExpired = false;
      lastFetchError = null;
      notifyListeners();
    }
  }

  Future<void> fetchData() async {
    try {
      isLoading = true;
      lastFetchError = null;
      notifyListeners();

      final response = await _client.get(
        Uri.parse(_apiUrl('/api/mobile-sync')),
        headers: _headers(),
      );
      if (response.statusCode == 401 || response.statusCode == 403) {
        // Token invalid/expired or member profile missing — force logout so the
        // UI routes to LoginView instead of showing stale data.
        await _handleSessionExpired(
          response.statusCode == 401
              ? 'Sesi Anda telah berakhir. Silakan login ulang.'
              : 'Akun Anda belum terhubung ke profil anggota.',
        );
        return;
      }
      if (response.statusCode != 200) {
        lastFetchError = 'Gagal memuat data (HTTP ${response.statusCode}).';
        isLoading = false;
        notifyListeners();
        return;
      }
      final jsonResponse = json.decode(response.body);
      if (jsonResponse is! Map) {
        lastFetchError = 'Respons server tidak valid.';
        isLoading = false;
        notifyListeners();
        return;
      }
      if (jsonResponse['success'] == true) {
        final data = jsonResponse['data'];

        // Sync admin stats if provided
        if (data['adminStats'] != null) {
          adminStats = data['adminStats'] as Map<String, dynamic>?;
        }

        final progress = data['dashboard']?['progress'];
        if (progress != null) {
          points = (progress['pointsBalance'] as num?)?.toInt() ?? points;
          xp = (progress['xp'] as num?)?.toInt() ?? xp;
          streak = (progress['currentStreak'] as num?)?.toInt() ?? streak;
          level = (progress['level'] as num?)?.toInt() ?? level;
          walletBalance =
              (progress['walletBalance'] as num?)?.toInt() ?? walletBalance;
          creditScore =
              (progress['creditScore'] as num?)?.toInt() ?? creditScore;
          _recomputeRank();
          _computeWeeklyStreak(progress['lastActivityDate']);
        }

        pointTransactions =
            data['dashboard']?['transactions'] as List<dynamic>? ?? [];

        // Phase 4b: active prank effect
        activeEffect = data['activeEffect'] as String?;

        // Sync notifications and profile data
        listNotifications = data['notifications'] ?? [];
        phoneNumber = data['profile']?['nomorHp'] ?? phoneNumber;

        if (data['profile']?['role'] != null) {
          role = data['profile']?['role'];
        }

        // Phase 4c: active loan
        activeLoan = data['activeLoan'] as Map<String, dynamic>?;

        final financials = data['financials'];
        if (financials != null) {
          simpananPokok = (financials['simpananPokok'] as num?)?.toInt() ?? 0;
          simpananWajib = (financials['simpananWajib'] as num?)?.toInt() ?? 0;
          simpananSukarela =
              (financials['simpananSukarela'] as num?)?.toInt() ?? 0;
          totalSimpanan = (financials['totalSavings'] as num?)?.toInt() ?? 0;
          listSavings = financials['savings'] ?? [];
          listLoans = financials['loans'] ?? [];
          listDues = financials['dues'] ?? [];
          listWalletTxs = financials['walletTransactions'] ?? [];
          listDisbursements = financials['disbursements'] ?? [];

          isMemberActive = financials['isMemberActive'] ?? true;
          isPokokPaid = financials['isPokokPaid'] ?? true;
          isWajibPaidThisMonth = financials['isWajibPaidThisMonth'] ?? true;
          pendingWajibAmount =
              (financials['pendingWajibAmount'] as num?)?.toInt() ?? 0;
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

        if (data['claimedChests'] != null && data['claimedChests'] is List) {
          claimedChests = (data['claimedChests'] as List)
              .map((e) => (e as num).toInt())
              .toList();
        } else {
          claimedChests = [];
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
            myStats = arena['myStats'] as Map<String, dynamic>?;
            opStats = arena['opStats'] as Map<String, dynamic>?;
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
          totalAsetDesa = (governance['totalAsetDesa'] as num?)?.toInt() ?? 0;
          asetKas = (governance['asetKas'] as num?)?.toInt() ?? 0;
          asetPinjaman = (governance['asetPinjaman'] as num?)?.toInt() ?? 0;
          asetInvestasi = (governance['asetInvestasi'] as num?)?.toInt() ?? 0;
          canSubmitProposal = level >= 20;
          canSubmitEvent = level >= 20;
          voteSelection = governance['userVote'] as String?;
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
          leaderboardByKoperasi = leaderboardData;
        }

        // Phase 3: multi-scope leaderboards
        final lbProv = data['leaderboardByProvinsi'];
        if (lbProv != null && lbProv is List) {
          leaderboardByProvinsi = lbProv;
        }
        final lbNas = data['leaderboardByNasional'];
        if (lbNas != null && lbNas is List) {
          leaderboardByNasional = lbNas;
        }

        final inventoryData = data['inventory'];
        if (inventoryData != null && inventoryData is List) {
          inventory = inventoryData
              .map<InventoryItem>((i) => InventoryItem.fromJson(i))
              .toList();
        }

        // Phase 1: marketplace P2P items
        final mpData = data['marketplaceItems'];
        if (mpData != null && mpData is List) {
          marketplaceItems = mpData
              .map<MarketplaceItem>((m) => MarketplaceItem.fromJson(m))
              .toList();
        }

        // Phase 2: events
        final evData = data['events'];
        if (evData != null && evData is List) {
          events =
              evData.map<EventModel>((e) => EventModel.fromJson(e)).toList();
        }
        final joinedData = data['joinedEventIds'];
        if (joinedData != null && joinedData is List) {
          joinedEventIds =
              joinedData.map<int>((id) => (id as num).toInt()).toSet();
        }

        // Phase 4a: active members directory
        final amData = data['activeMembers'];
        if (amData != null && amData is List) {
          activeMembers = amData;
        }
      } else {
        // success:false response from server
        lastFetchError =
            jsonResponse['error']?.toString() ?? 'Gagal memuat data.';
      }
    } catch (e) {
      print('Fetch err: $e');
      lastFetchError = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void _recomputeRank() {
    final int levelScore = level * 50;
    final int balanceScore = walletBalance ~/ 10000;
    final int creditScorePoints = creditScore * 5;
    membershipScore = levelScore + balanceScore + creditScorePoints;

    if (membershipScore < 2500) {
      rankName = 'Perunggu';
      nextRankName = 'Perak';
      nextLevelPoints = 2500;
    } else if (membershipScore < 5000) {
      rankName = 'Perak';
      nextRankName = 'Emas';
      nextLevelPoints = 5000;
    } else if (membershipScore < 10000) {
      rankName = 'Emas';
      nextRankName = 'Platinum';
      nextLevelPoints = 10000;
    } else if (membershipScore < 25000) {
      rankName = 'Platinum';
      nextRankName = 'Legenda';
      nextLevelPoints = 25000;
    } else {
      rankName = 'Legenda';
      nextRankName = 'Legenda';
      nextLevelPoints = membershipScore; // capped
    }
  }

  void _computeWeeklyStreak(String? lastActivityStr) {
    if (lastActivityStr == null) return;
    try {
      final lastActivity = DateTime.parse(lastActivityStr);
      final dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      final newStreak = <String, bool>{for (final k in dayLabels) k: false};
      final today = DateTime.now();
      final isSameDay = (DateTime a, DateTime b) =>
          a.year == b.year && a.month == b.month && a.day == b.day;

      // Edge case: user has just logged in today but the server hasn't yet
      // bumped currentStreak from 0 -> 1 (the streak is updated lazily on the
      // first quest completion / event join of the day, not on login itself).
      // Treat lastActivity == today as "active today" and surface a streak
      // of at least 1 so the UI reflects reality.
      int effectiveStreak = streak;
      if (streak == 0 && isSameDay(lastActivity, today)) {
        effectiveStreak = 1;
        streak = 1;
      }

      final streakCount = effectiveStreak.clamp(0, 7);
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
      final body = await _postAction({
        'action': 'toggle-quest',
        'memberId': memberId,
        'questId': int.parse(id),
      });
      if (body['success'] == true) {
        await fetchData();
        final reward = questRewardPoints ?? 0;
        return 'Misi selesai! +$reward Poin';
      }
      return body['error']?.toString() ??
          'Gagal klaim misi (mungkin belum selesai).';
    } catch (e) {
      print('Claim mission error: $e');
      return 'Gagal menyimpan ke server.';
    }
  }

  Future<String> claimWeeklyChest(int chestIndex) async {
    try {
      final body = await _postAction({
        'action': 'claim-chest',
        'memberId': memberId,
        'chestIndex': chestIndex,
      });
      if (body['success'] == true) {
        await fetchData();
        final reward = body['rewardPoints'] ?? 0;
        return 'Peti Harta Terbuka! +$reward Poin';
      }
      return body['error']?.toString() ?? 'Gagal klaim peti harta.';
    } catch (e) {
      print('Claim chest error: $e');
      return 'Gagal menyimpan ke server.';
    }
  }

  Future<String> buyShopItem(ShopItem item) async {
    if (points < item.cost) {
      return 'Poin tidak mencukupi untuk membeli ${item.title}';
    }
    try {
      final body = await _postAction({
        'action': 'buy-item',
        'memberId': memberId,
        'itemId': item.id,
        'cost': item.cost,
      });
      if (body['success'] == true) {
        points = (body['updatedPoints'] as num?)?.toInt() ?? points;
        await fetchData();
        return 'Berhasil membeli ${item.title}! -${item.cost} Poin';
      }
      return body['error']?.toString() ?? 'Gagal memproses pembelian.';
    } catch (e) {
      print('Buy item error: $e');
      return 'Gagal memproses pembelian di server.';
    }
  }

  Future<String> useInventoryItem(int itemId, {int? targetMemberId}) async {
    try {
      final body = await _postAction({
        'action': 'use-item',
        'memberId': memberId,
        'itemId': itemId,
        if (targetMemberId != null) 'targetMemberId': targetMemberId,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Item digunakan!';
      }
      return body['error']?.toString() ?? 'Gagal menggunakan item.';
    } catch (e) {
      print('Use item error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> submitVote(String choice) async {
    final proposal = activeProposals.isNotEmpty ? activeProposals[0] : null;
    final proposalId = proposal?['id'] ?? 1;
    try {
      final body = await _postAction({
        'action': 'vote',
        'memberId': memberId,
        'proposalId': proposalId,
        'voteType': choice,
      });
      if (body['success'] == true) {
        voteSelection = choice;
        notifyListeners();
        return 'Terima kasih! Pilihan Anda ($choice) disimpan.';
      }
      return body['error']?.toString() ?? 'Gagal mengirim voting ke server.';
    } catch (e) {
      print('Vote error: $e');
      return 'Gagal mengirim voting ke server.';
    }
  }

  Future<String> submitProposal(String title, String description) async {
    try {
      final body = await _postAction({
        'action': 'submit-proposal',
        'memberId': memberId,
        'title': title,
        'description': description,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Proposal berhasil diajukan untuk persetujuan admin.';
      }
      return body['error']?.toString() ?? 'Gagal membuat proposal.';
    } catch (e) {
      print('Submit proposal error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> submitEvent(String name, String description, DateTime startDate, DateTime endDate) async {
    try {
      final body = await _postAction({
        'action': 'submit-event',
        'memberId': memberId,
        'name': name,
        'description': description,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Event berhasil diajukan untuk persetujuan admin.';
      }
      return body['error']?.toString() ?? 'Gagal membuat event.';
    } catch (e) {
      print('Submit event error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<Map<String, dynamic>> createTopUp(int amount) async {
    try {
      final body = await _postAction({
        'action': 'create-topup',
        'memberId': memberId,
        'amount': amount,
      });
      if (body['success'] == true) {
        return {
          'success': true,
          'invoiceId': body['invoiceId'],
          'invoiceUrl': body['invoiceUrl'],
        };
      }
      return {
        'success': false,
        'error': body['error'] ?? 'Gagal membuat invoice.'
      };
    } catch (e) {
      print('Create topup error: $e');
      return {'success': false, 'error': 'Gagal menghubungi server.'};
    }
  }

  Future<Map<String, dynamic>> verifyTopUp(String invoiceId) async {
    try {
      final body = await _postAction({
        'action': 'verify-topup',
        'memberId': memberId,
        'invoiceId': invoiceId,
      });
      if (body['success'] == true) {
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
      final body = await _postAction({
        'action': 'pay-dues-wallet',
        'memberId': memberId,
        'type': type,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal membayar iuran.';
    } catch (e) {
      print('Pay dues wallet error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> depositSavingsFromWallet(
      int amount, String description) async {
    try {
      final body = await _postAction({
        'action': 'deposit-savings-wallet',
        'memberId': memberId,
        'amount': amount,
        'description': description,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal menabung.';
    } catch (e) {
      print('Deposit savings wallet error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> withdrawWallet({
    required int amount,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) async {
    try {
      final body = await _postAction({
        'action': 'withdraw-wallet',
        'amount': amount,
        'bankCode': bankCode,
        'accountNumber': accountNumber,
        'accountName': accountName,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal memproses penarikan.';
    } catch (e) {
      print('Withdraw wallet error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> deleteNotification(int notifId) async {
    try {
      final body = await _postAction({
        'action': 'delete-notification',
        'notificationId': notifId,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal menghapus notifikasi.';
    } catch (e) {
      print('Delete notification error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> createTestNotification() async {
    try {
      final body = await _postAction({
        'action': 'create-test-notification',
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal membuat notifikasi tes.';
    } catch (e) {
      print('Create test notification error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> updatePhone(String newPhone) async {
    try {
      final body = await _postAction({
        'action': 'update-phone',
        'newPhone': newPhone,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal memperbarui nomor telepon.';
    } catch (e) {
      print('Update phone error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> applyLoan(int amount) async {
    try {
      final body = await _postAction({
        'action': 'apply-loan',
        'amount': amount,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal mengajukan pinjaman.';
    } catch (e) {
      print('Apply loan error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> payLoan(int loanId) async {
    try {
      final body = await _postAction({
        'action': 'pay-loan',
        'loanId': loanId,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'success';
      }
      return body['error']?.toString() ?? 'Gagal membayar pinjaman.';
    } catch (e) {
      print('Pay loan error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  // ============ PHASE 1: MARKETPLACE P2P ============

  Future<String> listMarketplaceItem({
    required String name,
    String description = '',
    required int priceInPoints,
    required int stock,
    String? imageUrl,
  }) async {
    try {
      if (points < 0) {
        return 'Poin tidak valid.';
      }
      final body = await _postAction({
        'action': 'list-marketplace-item',
        'memberId': memberId,
        'name': name,
        'description': description,
        'priceInPoints': priceInPoints,
        'stock': stock,
        'imageUrl': imageUrl ?? '',
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Barang berhasil didaftarkan ke marketplace!';
      }
      return body['error']?.toString() ?? 'Gagal mendaftarkan barang.';
    } catch (e) {
      print('List marketplace item error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> buyMarketplaceItem(int itemId) async {
    try {
      final body = await _postAction({
        'action': 'buy-marketplace-item',
        'memberId': memberId,
        'itemId': itemId,
      });
      if (body['success'] == true) {
        final newBalance = (body['updatedPoints'] as num?)?.toInt();
        if (newBalance != null) points = newBalance;
        await fetchData();
        return 'Berhasil membeli barang!';
      }
      return body['error']?.toString() ?? 'Gagal membeli barang.';
    } catch (e) {
      print('Buy marketplace item error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  // ============ PHASE 2: EVENTS ============

  Future<String> joinEvent(int eventId) async {
    try {
      final body = await _postAction({
        'action': 'join-event',
        'memberId': memberId,
        'eventId': eventId,
      });
      if (body['success'] == true) {
        joinedEventIds.add(eventId);
        notifyListeners();
        await fetchData();
        return 'Berhasil mendaftar ke event!';
      }
      return body['error']?.toString() ?? 'Gagal mendaftar ke event.';
    } catch (e) {
      print('Join event error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  Future<String> createEvent({
    required String name,
    String description = '',
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      final body = await _postAction({
        'action': 'create-event',
        'memberId': memberId,
        'name': name,
        'description': description,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Event berhasil dibuat!';
      }
      return body['error']?.toString() ?? 'Gagal membuat event.';
    } catch (e) {
      print('Create event error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  // ============ PHASE 4d: MATCHMAKE BATTLE ============

  Future<String> matchmakeBattle() async {
    try {
      final body = await _postAction({
        'action': 'matchmake-battle',
        'memberId': memberId,
      });
      if (body['success'] == true) {
        await fetchData();
        return 'Lawan ditemukan! Selamat bertanding!';
      }
      return body['error']?.toString() ?? 'Gagal mencari lawan.';
    } catch (e) {
      print('Matchmake error: $e');
      return 'Gagal menghubungi server.';
    }
  }

  // ============ PHASE 4b: PRANK EFFECT (lightweight check) ============

  Future<String?> checkActiveEffect() async {
    try {
      final response = await _client.get(
        Uri.parse(_apiUrl('/api/mobile-sync')),
        headers: _headers(),
      );
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['success']) {
          final newEffect = jsonResponse['data']?['activeEffect'] as String?;
          if (newEffect != null && newEffect != activeEffect) {
            activeEffect = newEffect;
            notifyListeners();
            return newEffect;
          }
        }
      }
    } catch (_) {}
    return null;
  }
}
