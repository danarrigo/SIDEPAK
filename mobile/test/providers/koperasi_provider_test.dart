import 'dart:convert';
import 'dart:io' show SocketException;
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile/providers/koperasi_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

KoperasiProvider _newProviderWith(MockClient client) {
  final p = KoperasiProvider();
  // Override token to allow requests
  p.token = 'test-token';
  p.memberId = 1;
  // Force replacement of singleton http via setApiForTesting
  KoperasiProvider.apiClientOverride = client;
  return p;
}

// Lightweight http override hook
extension on KoperasiProvider {
  // ignore: unused_element
  void useClient(MockClient client) {
    KoperasiProvider.apiClientOverride = client;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  group('_recomputeRank (private, exercised via fetchData)', () {
    test('level < 10 -> Perunggu / next Perak', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {
              'dashboard': {
                'progress': {
                  'pointsBalance': 0,
                  'xp': 0,
                  'currentStreak': 0,
                  'level': 5,
                  'lastActivityDate': null,
                },
                'transactions': [],
                'level': 5,
              },
            }
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });
      final p = _newProviderWith(mock);
      await p.fetchData();
      expect(p.level, 5);
      expect(p.rankName, 'Perunggu');
      expect(p.nextRankName, 'Perak');
      expect(p.nextLevelPoints, 5 * 1000);
    });

    test('level 25 -> Emas / next Platinum', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {
              'dashboard': {
                'progress': {'pointsBalance': 0, 'xp': 0, 'currentStreak': 0, 'level': 25, 'lastActivityDate': null},
                'transactions': [],
                'level': 25,
              },
            }
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });
      final p = _newProviderWith(mock);
      await p.fetchData();
      expect(p.rankName, 'Emas');
      expect(p.nextRankName, 'Platinum');
    });

    test('level 45 -> Legenda / next Legenda (capped)', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {
              'dashboard': {
                'progress': {'pointsBalance': 0, 'xp': 0, 'currentStreak': 0, 'level': 45, 'lastActivityDate': null},
                'transactions': [],
                'level': 45,
              },
            }
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });
      final p = _newProviderWith(mock);
      await p.fetchData();
      expect(p.rankName, 'Legenda');
      expect(p.nextRankName, 'Legenda');
    });
  });

  group('fetchData parses new data sources', () {
    test('populates marketplaceItems, events, joinedEventIds, activeMembers, activeLoan, activeEffect, leaderboard scopes', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {
              'dashboard': {
                'progress': {
                  'pointsBalance': 1500,
                  'xp': 2500,
                  'currentStreak': 3,
                  'level': 12,
                  'lastActivityDate': DateTime.now().toIso8601String(),
                },
                'transactions': [],
                'level': 12,
              },
              'marketplaceItems': [
                {
                  'id': 1, 'name': 'Buku', 'description': 'Buku tulis', 'priceInPoints': 50, 'stock': 2, 'sellerId': 5,
                  'seller': {'namaLengkap': 'Andi'}
                }
              ],
              'events': [
                {
                  'id': 1, 'name': 'Senam', 'description': 'Senam pagi',
                  'startDate': '2026-07-01T07:00:00.000Z', 'endDate': '2026-07-01T08:00:00.000Z',
                  'cooperativeId': 1
                }
              ],
              'joinedEventIds': [1, 2],
              'activeMembers': [
                {'id': 5, 'namaLengkap': 'Andi', 'nomorAnggota': 'A001'}
              ],
              'activeLoan': {'id': 1, 'amount': 500000, 'interestRate': 2, 'status': 'pending'},
              'activeEffect': 'Sakit Jantung',
              'leaderboard': [
                {'id': 5, 'namaLengkap': 'Andi', 'level': 12, 'xp': 2500, 'pointsBalance': 1500}
              ],
              'leaderboardByProvinsi': [
                {'id': 6, 'namaLengkap': 'Budi', 'level': 9, 'xp': 1800, 'pointsBalance': 900}
              ],
              'leaderboardByNasional': [
                {'id': 7, 'namaLengkap': 'Citra', 'level': 40, 'xp': 50000, 'pointsBalance': 30000}
              ],
            }
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });
      final p = _newProviderWith(mock);
      await p.fetchData();
      expect(p.points, 1500);
      expect(p.xp, 2500);
      expect(p.streak, 3);
      expect(p.activeEffect, 'Sakit Jantung');
      expect(p.marketplaceItems, hasLength(1));
      expect(p.marketplaceItems.first.name, 'Buku');
      expect(p.marketplaceItems.first.sellerName, 'Andi');
      expect(p.events, hasLength(1));
      expect(p.events.first.name, 'Senam');
      expect(p.joinedEventIds, {1, 2});
      expect(p.activeMembers, hasLength(1));
      expect(p.activeMembers.first['namaLengkap'], 'Andi');
      expect(p.activeLoan, isNotNull);
      expect(p.activeLoan!['amount'], 500000);
      expect(p.leaderboardByKoperasi, hasLength(1));
      expect(p.leaderboardByProvinsi, hasLength(1));
      expect(p.leaderboardByNasional, hasLength(1));
    });
  });

  group('Marketplace actions', () {
    test('listMarketplaceItem returns success message on 200', () async {
      final mock = MockClient((req) async {
        if (req.url.path.contains('/action')) {
          final body = json.decode(req.body) as Map<String, dynamic>;
          expect(body['action'], 'list-marketplace-item');
          expect(body['name'], 'Tas');
          return http.Response(json.encode({'success': true}), 200,
              headers: {'content-type': 'application/json'});
        }
        // follow-up fetchData
        return http.Response(
          json.encode({
            'success': true,
            'data': {'dashboard': {'progress': {}, 'transactions': []}}
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      final msg = await p.listMarketplaceItem(name: 'Tas', priceInPoints: 100, stock: 1);
      expect(msg, contains('berhasil'));
    });

    test('buyMarketplaceItem returns error message on failure', () async {
      final mock = MockClient((req) async {
        if (!req.url.path.contains('/action')) return http.Response('{}', 200);
        final body = json.decode(req.body) as Map<String, dynamic>;
        expect(body['action'], 'buy-marketplace-item');
        expect(body['itemId'], 5);
        return http.Response(
          json.encode({'success': false, 'error': 'Poin tidak mencukupi'}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      final msg = await p.buyMarketplaceItem(5);
      expect(msg, contains('Poin tidak mencukupi'));
    });
  });

  group('Event actions', () {
    test('joinEvent returns success and triggers refetch', () async {
      int callCount = 0;
      final mock = MockClient((req) async {
        callCount++;
        if (req.url.path.contains('/action')) {
          return http.Response(json.encode({'success': true}), 200,
              headers: {'content-type': 'application/json'});
        }
        // follow-up fetchData
        return http.Response(
          json.encode({
            'success': true,
            'data': {'dashboard': {'progress': {}, 'transactions': []}}
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      final msg = await p.joinEvent(42);
      expect(msg, contains('Berhasil'));
      expect(callCount, greaterThanOrEqualTo(2));
    });

    test('createEvent validates input via action body', () async {
      String? capturedName;
      final mock = MockClient((req) async {
        final body = json.decode(req.body) as Map<String, dynamic>;
        capturedName = body['name'] as String?;
        expect(body['action'], 'create-event');
        expect(body['startDate'], isA<String>());
        return http.Response(json.encode({'success': true}), 200,
            headers: {'content-type': 'application/json'});
      });
      final p = _newProviderWith(mock);
      final msg = await p.createEvent(
        name: 'Gotong Royong',
        startDate: DateTime(2026, 8, 1, 9),
        endDate: DateTime(2026, 8, 1, 12),
      );
      expect(msg, contains('berhasil'));
      expect(capturedName, 'Gotong Royong');
    });
  });

  group('matchmakeBattle', () {
    test('returns success message on match found', () async {
      final mock = MockClient((req) async {
        final body = json.decode(req.body) as Map<String, dynamic>;
        expect(body['action'], 'matchmake-battle');
        return http.Response(json.encode({'success': true}), 200,
            headers: {'content-type': 'application/json'});
      });
      final p = _newProviderWith(mock);
      final msg = await p.matchmakeBattle();
      expect(msg.toLowerCase(), contains('ditemukan'));
    });

    test('returns server error message on failure', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({'success': false, 'error': 'Tidak ada lawan'}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      final msg = await p.matchmakeBattle();
      expect(msg, contains('Tidak ada lawan'));
    });
  });

  group('checkActiveEffect', () {
    test('returns new effect when server reports a different one', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {'activeEffect': 'Prank Baru'}
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      p.activeEffect = 'Prank Lama';
      final newEffect = await p.checkActiveEffect();
      expect(newEffect, 'Prank Baru');
      expect(p.activeEffect, 'Prank Baru');
    });

    test('returns null when effect is unchanged', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({
            'success': true,
            'data': {'activeEffect': 'Sama'}
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      p.activeEffect = 'Sama';
      final newEffect = await p.checkActiveEffect();
      expect(newEffect, isNull);
    });
  });

  // ============ AUTH & SESSION EXPIRY TESTS ============

  group('Authentication & session expiry', () {
    test('fetchData on 401 clears session and sets sessionExpired', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({'success': false, 'error': 'Invalid or expired session token'}),
          401,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      // Set initial logged-in state
      p.isLoggedIn = true;
      p.activeLoan = {'id': 1};
      p.activeEffect = 'Old effect';
      await p.fetchData();

      expect(p.isLoggedIn, isFalse);
      expect(p.token, isNull);
      expect(p.memberId, isNull);
      expect(p.sessionExpired, isTrue);
      expect(p.lastFetchError, contains('Sesi Anda telah berakhir'));
      // Sensitive data should be cleared
      expect(p.activeLoan, isNull);
      expect(p.activeEffect, isNull);
    });

    test('fetchData on 403 (no member profile) sets account-not-linked error', () async {
      final mock = MockClient((req) async {
        return http.Response(
          json.encode({'success': false, 'error': 'No member profile linked to this account'}),
          403,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      p.isLoggedIn = true;
      await p.fetchData();
      expect(p.isLoggedIn, isFalse);
      expect(p.sessionExpired, isTrue);
      expect(p.lastFetchError, contains('profil anggota'));
    });

    test('fetchData on 500 sets generic error without logging out', () async {
      final mock = MockClient((req) async {
        return http.Response('Internal Server Error', 500,
            headers: {'content-type': 'text/plain'});
      });
      final p = _newProviderWith(mock);
      p.isLoggedIn = true;
      await p.fetchData();
      // User is NOT logged out on 5xx (transient server error)
      expect(p.isLoggedIn, isTrue);
      expect(p.sessionExpired, isFalse);
      expect(p.lastFetchError, contains('Gagal memuat data'));
    });

    test('fetchData on network failure sets connection error', () async {
      final mock = MockClient((req) async {
        throw const SocketException('No internet');
      });
      final p = _newProviderWith(mock);
      p.isLoggedIn = true;
      await p.fetchData();
      expect(p.isLoggedIn, isTrue); // not logged out on network error
      expect(p.lastFetchError, contains('Tidak dapat terhubung'));
    });

    test('login returns null on success, error string on failure', () async {
      final mock = MockClient((req) async {
        if (req.url.path.endsWith('/api/auth/login')) {
          return http.Response(
            json.encode({'success': false, 'error': 'Invalid login credentials'}),
            400,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('{}', 500);
      });
      final p = _newProviderWith(mock);
      final result = await p.login('test@test.com', 'wrongpass');
      expect(result, 'Invalid login credentials');
      expect(p.isLoggedIn, isFalse);
    });

    test('login with 500 returns user-friendly error, does not throw', () async {
      final mock = MockClient((req) async {
        return http.Response('boom', 500,
            headers: {'content-type': 'text/plain'});
      });
      final p = _newProviderWith(mock);
      final result = await p.login('test@test.com', 'any');
      expect(result, contains('Server error'));
    });

    test('login with network exception returns connection error', () async {
      final mock = MockClient((req) async {
        throw const SocketException('Connection refused');
      });
      final p = _newProviderWith(mock);
      final result = await p.login('test@test.com', 'any');
      expect(result, contains('Tidak dapat terhubung'));
    });

    test('login with success stores token and clears sessionExpired', () async {
      final mock = MockClient((req) async {
        if (req.url.path.endsWith('/api/auth/login')) {
          return http.Response(
            json.encode({
              'success': true,
              'token': 'new-jwt',
              'memberId': 5,
              'email': 'a@b.com',
              'fullName': 'Test User',
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        // follow-up fetchData
        return http.Response(
          json.encode({
            'success': true,
            'data': {'dashboard': {'progress': {}, 'transactions': []}}
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });
      final p = _newProviderWith(mock);
      p.sessionExpired = true;
      p.lastFetchError = 'Old error';
      final result = await p.login('a@b.com', 'goodpass');
      expect(result, isNull);
      expect(p.token, 'new-jwt');
      expect(p.memberId, 5);
      expect(p.isLoggedIn, isTrue);
      expect(p.sessionExpired, isFalse);
    });

    test('action POST on 401 also triggers session expiry + returns sessionExpired flag', () async {
      final mock = MockClient((req) async {
        if (req.url.path.endsWith('/action')) {
          return http.Response(
            json.encode({'success': false, 'error': 'Invalid or expired session token'}),
            401,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('{}', 500);
      });
      final p = _newProviderWith(mock);
      p.isLoggedIn = true;
      final result = await p.claimMission('1', 100);
      // The returned error string includes the server's message
      expect(result, isNotNull);
      // AND the provider should have been logged out + flagged
      expect(p.isLoggedIn, isFalse);
      expect(p.sessionExpired, isTrue);
      expect(p.token, isNull);
    });

    test('clearSessionExpired resets flags and notifies', () async {
      final mock = MockClient((req) async {
        return http.Response('{}', 200);
      });
      final p = _newProviderWith(mock);
      p.sessionExpired = true;
      p.lastFetchError = 'Old error';
      p.clearSessionExpired();
      expect(p.sessionExpired, isFalse);
      expect(p.lastFetchError, isNull);
    });
  });
}
