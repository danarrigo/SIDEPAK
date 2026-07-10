import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'widgets/use_item_sheet.dart';

class BattleView extends StatelessWidget {
  const BattleView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final int p1 = (provider.activeBattle != null
        ? (provider.activeBattle!['challengerId'] == provider.memberId
            ? provider.activeBattle!['challengerPoints']
            : provider.activeBattle!['opponentPoints'])
        : 0) as int;
    final int p2 = (provider.activeBattle != null
        ? (provider.activeBattle!['challengerId'] == provider.memberId
            ? provider.activeBattle!['opponentPoints']
            : provider.activeBattle!['challengerPoints'])
        : 0) as int;

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
                  Icon(Icons.bolt, color: Colors.white, size: 28),
                  SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Arena Bertanding',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold)),
                      Text('Bertanding Mingguan – reset setiap senin 00:00',
                          style: TextStyle(color: Colors.white60, fontSize: 10))
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
                  if (provider.activeBattle == null)
                    _buildEmptyBattleCard(provider),
                  if (provider.activeBattle != null)
                    Card(
                      color: const Color(0xFF6D7D91),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(32)),
                      elevation: 4,
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text('Battle Minggu Ini',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildPlayerCol(
                                  provider.fullName != null &&
                                          provider.fullName!.isNotEmpty
                                      ? provider.fullName!
                                          .substring(0, 1)
                                          .toUpperCase()
                                      : 'A',
                                  provider.fullName != null &&
                                          provider.fullName!.isNotEmpty
                                      ? provider.fullName!.split(' ')[0]
                                      : 'Anda',
                                  '$p1 XP',
                                ),
                                const Text('VS',
                                    style: TextStyle(
                                        color: Colors.amber,
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                        fontStyle: FontStyle.italic)),
                                _buildPlayerCol(
                                  provider.activeBattle!['challengerId'] ==
                                          provider.memberId
                                      ? (provider.activeBattle!['opponent']
                                                  ?['namaLengkap']
                                              ?.toString()
                                              .substring(0, 1)
                                              .toUpperCase() ??
                                          'L')
                                      : (provider.activeBattle!['challenger']
                                                  ?['namaLengkap']
                                              ?.toString()
                                              .substring(0, 1)
                                              .toUpperCase() ??
                                          'L'),
                                  provider.activeBattle!['challengerId'] ==
                                          provider.memberId
                                      ? (provider.activeBattle!['opponent']
                                                  ?['namaLengkap']
                                              ?.toString()
                                              .split(' ')[0] ??
                                          'Lawan')
                                      : (provider.activeBattle!['challenger']
                                                  ?['namaLengkap']
                                              ?.toString()
                                              .split(' ')[0] ??
                                          'Lawan'),
                                  '$p2 XP',
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            // "Gunakan Item" button — opens bottom sheet to
                            // apply an inventory power-up against the opponent.
                            Align(
                              alignment: Alignment.center,
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(24),
                                  onTap: () {
                                    final battle = provider.activeBattle;
                                    if (battle == null) return;
                                    // Resolve opponent id (whichever side isn't the current member)
                                    final isChallenger =
                                        battle['challengerId'] ==
                                            provider.memberId;
                                    final opponentId = isChallenger
                                        ? battle['opponentId']
                                        : battle['challengerId'];
                                    if (opponentId == null) {
                                      ScaffoldMessenger.of(context)
                                          .clearSnackBars();
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                              'Lawan belum tersedia. Selesaikan matchmaking terlebih dahulu.',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold)),
                                          behavior: SnackBarBehavior.floating,
                                        ),
                                      );
                                      return;
                                    }
                                    showModalBottomSheet(
                                      context: context,
                                      backgroundColor: Colors.white,
                                      isScrollControlled: true,
                                      shape: const RoundedRectangleBorder(
                                        borderRadius: BorderRadius.vertical(
                                            top: Radius.circular(24)),
                                      ),
                                      builder: (ctx) => UseItemSheet(
                                          targetMemberId: opponentId as int),
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: provider.inventory.isEmpty
                                          ? Colors.white24
                                          : const Color(0xFFFACC15),
                                      borderRadius: BorderRadius.circular(24),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.auto_fix_high,
                                          color: provider.inventory.isEmpty
                                              ? Colors.white60
                                              : const Color(0xFF0F172A),
                                          size: 16,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Gunakan Item',
                                          style: TextStyle(
                                              color: provider.inventory.isEmpty
                                                  ? Colors.white60
                                                  : const Color(0xFF0F172A),
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(16)),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              child: Column(
                                children: [
                                  _buildComparisonRow(
                                      'XP Mingguan', '$p1', '$p2'),
                                  const Divider(
                                      color: Colors.white30, height: 16),
                                  _buildComparisonRow(
                                      'Streak Belajar',
                                      '${provider.streak} Hari',
                                      provider.activeBattle != null
                                          ? '${provider.activeBattle!['opponentStreak'] ?? 0} Hari'
                                          : '0 Hari'),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              provider.activeBattleEndDate != null
                                  ? 'Berakhir pada: ${DateTime.tryParse(provider.activeBattleEndDate!)?.toLocal().toString().split(' ')[0] ?? provider.activeBattleEndDate}'
                                  : 'Berakhir: Minggu 23:59',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  color: Colors.white60,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (provider.activeBattle != null) ...[
                    const SizedBox(height: 24),
                    _buildDetailPertandinganCard(context, provider),
                    const SizedBox(height: 24),
                    _buildCaraMendapatkanPoinGrid(context),
                    const SizedBox(height: 24),
                  ],
                  const Text('Riwayat Bertanding',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF475569))),
                  const SizedBox(height: 12),
                  provider.historyList.isEmpty
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                              vertical: 24, horizontal: 16),
                          decoration: BoxDecoration(
                            border: Border.all(
                                color: const Color(0xFFCBD5E1), width: 2),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: const Text(
                            'Belum ada riwayat pertandingan.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                                fontWeight: FontWeight.bold),
                          ),
                        )
                      : Container(
                          decoration: BoxDecoration(
                              border: Border.all(
                                  color: const Color(0xFFCBD5E1), width: 2),
                              borderRadius: BorderRadius.circular(24)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                          child: ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: provider.historyList.length,
                            separatorBuilder: (c, i) =>
                                const Divider(color: Colors.grey, height: 16),
                            itemBuilder: (context, index) {
                              final item = provider.historyList[index];
                              final bool isWin = item.result == 'Menang';
                              return Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 64,
                                        decoration: BoxDecoration(
                                          color: isWin
                                              ? const Color(0xFFDCFCE7)
                                              : const Color(0xFFFEE2E2),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                              color: isWin
                                                  ? const Color(0xFF86EFAC)
                                                  : const Color(0xFFFECACA)),
                                        ),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 4),
                                        alignment: Alignment.center,
                                        child: Text(
                                          item.result,
                                          style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: isWin
                                                  ? const Color(0xFF16A34A)
                                                  : const Color(0xFFEF4444)),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text('vs ${item.opponent}',
                                              style: const TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.bold,
                                                  color: Color(0xFF64748B))),
                                          if (item.date != null)
                                            Text(item.date!,
                                                style: const TextStyle(
                                                    fontSize: 9,
                                                    color: Colors.grey)),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Text('${item.points} poin',
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.orange)),
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
      ),
    );
  }

  Widget _buildPlayerCol(String initials, String name, String subText) {
    return Column(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: Colors.white24,
          child: CircleAvatar(
            radius: 36,
            backgroundColor: Colors.grey.shade300,
            child: Text(initials,
                style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 20,
                    fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 8),
        Text(name,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold)),
        Text(subText,
            style: const TextStyle(
                color: Colors.white70,
                fontSize: 10,
                fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildComparisonRow(String metric, String userVal, String oppVal) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
            flex: 2,
            child: Text(metric,
                style: const TextStyle(color: Colors.white, fontSize: 11))),
        Expanded(
            child: Text(userVal,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: Color(0xFFF83A4C),
                    fontSize: 11,
                    fontWeight: FontWeight.bold))),
        Expanded(
            child: Text(oppVal,
                textAlign: TextAlign.right,
                style: const TextStyle(
                    color: Color(0xFF39C2F6),
                    fontSize: 11,
                    fontWeight: FontWeight.bold))),
      ],
    );
  }

  Widget _buildEmptyBattleCard(KoperasiProvider provider) {
    return _EmptyBattleCard(provider: provider);
  }

  Widget _buildDetailPertandinganCard(
      BuildContext context, KoperasiProvider provider) {
    final my = provider.myStats ?? {};
    final op = provider.opStats ?? {};

    Widget buildRow(String label, dynamic val1, dynamic val2) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '$val1 pts',
                textAlign: TextAlign.left,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF0F172A)),
              ),
            ),
            Expanded(
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 11,
                    fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              child: Text(
                '$val2 pts',
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF0F172A)),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Detail Pertandingan',
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF475569)),
        ),
        const SizedBox(height: 8),
        Card(
          color: Colors.white,
          surfaceTintColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          elevation: 1,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                buildRow('Misi Harian', my['missionsCompleted'] ?? 0,
                    op['missionsCompleted'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Penyetoran Tabungan', my['savingsPts'] ?? 0,
                    op['savingsPts'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Konsistensi Login (Streak)', my['activeStreak'] ?? 0,
                    op['activeStreak'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Belanja di Koperasi', my['shopPurchases'] ?? 0,
                    op['shopPurchases'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow(
                    'Aktivitas Marketplace',
                    my['marketplaceActivity'] ?? 0,
                    op['marketplaceActivity'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Partisipasi Acara', my['eventsJoined'] ?? 0,
                    op['eventsJoined'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Peminjaman Dana', my['loansCount'] ?? 0,
                    op['loansCount'] ?? 0),
                const Divider(color: Color(0xFFF1F5F9)),
                buildRow('Kemenangan Battle', my['battlesWon'] ?? 0,
                    op['battlesWon'] ?? 0),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCaraMendapatkanPoinGrid(BuildContext context) {
    final items = [
      {'title': 'Menabung', 'desc': 'Setor tabungan', 'icon': Icons.savings},
      {
        'title': 'Belanja',
        'desc': 'Belanja koperasi',
        'icon': Icons.shopping_cart
      },
      {'title': 'Acara', 'desc': 'Ikuti kegiatan', 'icon': Icons.event},
      {
        'title': 'Marketplace',
        'desc': 'Jual/beli produk',
        'icon': Icons.storefront
      },
      {
        'title': 'Misi Harian',
        'desc': 'Selesaikan tugas',
        'icon': Icons.task_alt
      },
      {
        'title': 'Konsistensi',
        'desc': 'Jaga streak login',
        'icon': Icons.local_fire_department
      },
      {
        'title': 'Pinjaman',
        'desc': 'Gunakan pinjaman',
        'icon': Icons.account_balance
      },
      {
        'title': 'Kemenangan',
        'desc': 'Menangkan battle',
        'icon': Icons.emoji_events
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Cara Mendapatkan Poin',
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF475569)),
        ),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.2,
          ),
          itemCount: items.length,
          itemBuilder: (context, i) {
            final item = items[i];
            return Card(
              color: Colors.white,
              surfaceTintColor: Colors.white,
              elevation: 1,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: const Color(0xFFF1F5F9),
                      child: Icon(item['icon'] as IconData,
                          size: 16, color: const Color(0xFF334155)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            item['title'] as String,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                                color: Color(0xFF1E293B)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item['desc'] as String,
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 9),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _EmptyBattleCard extends StatefulWidget {
  final KoperasiProvider provider;
  const _EmptyBattleCard({required this.provider});

  @override
  State<_EmptyBattleCard> createState() => _EmptyBattleCardState();
}

class _EmptyBattleCardState extends State<_EmptyBattleCard> {
  bool _attempted = false;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_attempted) {
        _attempted = true;
        _autoMatchmake();
      }
    });
  }

  Future<void> _autoMatchmake() async {
    final msg = await widget.provider.matchmakeBattle();
    if (!mounted) return;

    final isErr = !msg.toLowerCase().contains('ditemukan') &&
        !msg.toLowerCase().contains('berhasil');

    if (isErr) {
      setState(() {
        _errorMsg = msg;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMsg != null) {
      return Container(
        margin: const EdgeInsets.only(top: 16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.red.shade100),
        ),
        child: Column(
          children: [
            const Icon(Icons.group_off, color: Colors.red, size: 32),
            const SizedBox(height: 8),
            Text(
              _errorMsg!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }

    return Card(
      color: Colors.white,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFF1F5F9))),
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(Icons.sports_kabaddi,
                color: Color(0xFFCBD5E1), size: 64),
            const SizedBox(height: 16),
            const Text(
              'Mulai Pertandingan',
              style: TextStyle(
                  color: Color(0xFF334155),
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            const Text(
              'Dapatkan poin tambahan dengan memenangkan pertandingan mingguan.',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Column(
              children: [
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                      color: Color(0xFFFACC15), strokeWidth: 3),
                ),
                const SizedBox(height: 8),
                Text(
                  'Mencari Lawan...',
                  style: TextStyle(
                      color: const Color(0xFFFACC15).withOpacity(0.8),
                      fontSize: 14,
                      fontWeight: FontWeight.bold),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
