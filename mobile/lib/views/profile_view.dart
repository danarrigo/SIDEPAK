import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'package:url_launcher/url_launcher.dart';

const _rankColors = <String, List<Color>>{
  'Perunggu': [Color(0xFFB45309), Color(0xFF78350F)],
  'Perak': [Color(0xFF94A3B8), Color(0xFF475569)],
  'Emas': [Color(0xFFFBBF24), Color(0xFFB45309)],
  'Platinum': [Color(0xFF22D3EE), Color(0xFF2563EB)],
  'Legenda': [Color(0xFFA855F7), Color(0xFFC026D3)],
};

const _rankIcons = <String, IconData>{
  'Perunggu': Icons.eco,
  'Perak': Icons.military_tech,
  'Emas': Icons.workspace_premium,
  'Platinum': Icons.diamond,
  'Legenda': Icons.grade,
};

class ProfileView extends StatelessWidget {
  final VoidCallback onLogout;

  const ProfileView({
    super.key,
    required this.onLogout,
  });

  String fmtMoney(int v) =>
      'Rp ${v.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}';

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final initials = provider.fullName != null && provider.fullName!.isNotEmpty
        ? provider.fullName!.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase()
        : 'AG';
    final rankGradient = _rankColors[provider.rankName] ?? _rankColors['Perunggu']!;
    final rankIcon = _rankIcons[provider.rankName] ?? Icons.eco;
    final int totalSimpananDisplay = provider.totalSimpanan > 0
        ? provider.totalSimpanan
        : provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela;
    final estimasiSHU = totalSimpananDisplay > 0 ? (totalSimpananDisplay * 0.12).floor() : 0;

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Rank gradient digital member card
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: rankGradient,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 32),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),
                        Text(
                          provider.fullName ?? 'Anggota',
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                        ),
                        const SizedBox(height: 6),
                        GestureDetector(
                          onLongPress: () => _showBenefitSheet(context, provider.rankName),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white30),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(rankIcon, color: Colors.white, size: 14),
                                const SizedBox(width: 4),
                                Text('RANK ${provider.rankName.toUpperCase()}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                const SizedBox(width: 4),
                                const Icon(Icons.info_outline, color: Colors.white70, size: 10),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'No. Anggota: KMP-DSKMJ-2026-${(provider.memberId ?? 1).toString().padLeft(4, '0')}',
                          style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        if (provider.email != null) ...[
                          const SizedBox(height: 2),
                          Text(provider.email!, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                        ],
                      ],
                    ),
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.white24,
                      child: CircleAvatar(
                        radius: 28,
                        backgroundColor: Colors.white,
                        child: Text(
                          initials,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTopBadge(Icons.local_fire_department, '${provider.streak} Hari Streak', Colors.white, Colors.white12, iconColor: Colors.orange),
                    const SizedBox(width: 8),
                    _buildTopBadge(Icons.workspace_premium, '${provider.xp} XP', Colors.white, Colors.white12, iconColor: Colors.amberAccent),
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
                // Wallet Balance Card
                Card(
                  color: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'SALDO DOMPET DIGITAL',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                              ),
                            ),
                            Icon(Icons.account_balance_wallet, color: Theme.of(context).primaryColor, size: 20),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          fmtMoney(provider.walletBalance),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            _showTopUpDialog(context, provider);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3B82F6),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          icon: const Icon(Icons.add_card, size: 16),
                          label: const Text(
                            'TOP UP SALDO',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                // Ranking row (mobile-only, but uses DB-backed rankName/level)
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
                              _buildRankItem(Icons.eco, 'Perunggu', Colors.greenAccent, provider.rankName == 'Perunggu'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.military_tech, 'Perak', Colors.amberAccent, provider.rankName == 'Perak'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.workspace_premium, 'Emas', const Color(0xFFF59E0B), provider.rankName == 'Emas'),
                              _buildRankDivider(),
                              _buildRankItem(Icons.diamond, 'Platinum', Colors.lightBlue, provider.rankName == 'Platinum', opacity: provider.level >= 30 ? 1.0 : 0.5),
                              _buildRankDivider(),
                              _buildRankItem(Icons.grade, 'Legenda', Colors.redAccent, provider.rankName == 'Legenda', opacity: provider.level >= 40 ? 1.0 : 0.5),
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

                // Active Loan Card (Phase 4c)
                if (provider.activeLoan != null) _buildActiveLoanCard(provider.activeLoan!),
                if (provider.activeLoan != null) const SizedBox(height: 16),

                // Dampak Personal (DB-backed)
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
                    _buildImpactCard('Total Simpanan', 'Rp ${(totalSimpananDisplay / 1000000).toStringAsFixed(1)}Jt'),
                    _buildImpactCard('Misi Diselesaikan', '${provider.missions.where((m) => m.isCompleted).length}'),
                    _buildImpactCard('Level Kamu', 'Level ${provider.level}'),
                    _buildImpactCard('Tingkat Kemenangan', '${provider.userWinRate}%'),
                  ],
                ),
                const SizedBox(height: 16),

                // Estimasi SHU (DB-backed)
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Estimasi SHU', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('Tahun Buku 2024', style: TextStyle(fontSize: 9, color: Colors.grey)),
                          ],
                        ),
                        Text(
                          fmtMoney(estimasiSHU),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Riwayat Aktivitas Poin (DB-backed via dashboard.transactions)
                const Text('Riwayat Aktivitas Poin', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: provider.pointTransactions.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Text('Belum ada aktivitas poin tercatat.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: provider.pointTransactions.length,
                            separatorBuilder: (_, __) => const Divider(color: Color(0xFFF1F5F9), height: 8),
                            itemBuilder: (context, i) {
                              final t = provider.pointTransactions[i];
                              final int amount = (t['amount'] as num?)?.toInt() ?? 0;
                              final bool isPositive = amount >= 0;
                              final String source = t['source']?.toString() ?? '';
                              final String description = t['description']?.toString() ?? source;
                              final String date = t['createdAt'] != null
                                  ? t['createdAt'].toString().split('T')[0]
                                  : '';
                              return Row(
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: isPositive ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                                      color: isPositive ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
                                      size: 16,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(description, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        Text('$source • $date', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '${isPositive ? '+' : ''}$amount XP',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: isPositive ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                // Mutasi & Ledger Keuangan (savings + loans, DB-backed)
                const Text('Mutasi & Ledger Keuangan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(                       crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (provider.listSavings.isEmpty && provider.listLoans.isEmpty && provider.listWalletTxs.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Text('Belum ada transaksi tercatat.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        else ...[
                          if (provider.listSavings.isNotEmpty) ...[
                            const Text('Simpanan & Penarikan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            const SizedBox(height: 8),
                            ...provider.listSavings.map((s) {
                              final bool isDeposit = s['type'] == 'deposit';
                              final int amount = (s['amount'] as num?)?.toInt() ?? 0;
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
                                      '${isDeposit ? "+" : "-"} ${fmtMoney(amount)}',
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
                          if (provider.listLoans.isNotEmpty) ...[
                            const Divider(height: 1),
                            const SizedBox(height: 12),
                            const Text('Status Pinjaman', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            const SizedBox(height: 8),
                            ...provider.listLoans.map((l) {
                              final int amount = (l['amount'] as num?)?.toInt() ?? 0;
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
                                        const Text('Pinjaman Dana', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        const SizedBox(height: 4),
                                        Container(
                                          decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          child: Text(status.toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor)),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      fmtMoney(amount),
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(height: 12),
                          ],
                          if (provider.listWalletTxs.isNotEmpty) ...[
                            if (provider.listSavings.isNotEmpty || provider.listLoans.isNotEmpty) ...[
                              const Divider(height: 1),
                              const SizedBox(height: 12),
                            ],
                            const Text('Top Up & Transaksi Dompet', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            const SizedBox(height: 8),
                            ...provider.listWalletTxs.map((w) {
                              final int amount = (w['amount'] as num?)?.toInt() ?? 0;
                              final String status = w['status'] ?? 'pending';
                              final String date = w['createdAt'] != null ? w['createdAt'].toString().split('T')[0] : '';
                              final Color statusColor = status == 'paid' ? const Color(0xFF16A34A) : const Color(0xFFF59E0B);
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Top Up Saldo Dompet', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Text(date, style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                            const SizedBox(width: 6),
                                            Container(
                                              decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                              child: Text(status.toUpperCase(), style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: statusColor)),
                                            ),
                                            if (status == 'pending') ...[
                                              const SizedBox(width: 8),
                                              GestureDetector(
                                                onTap: () async {
                                                  final invoiceId = w['invoiceId'];
                                                  if (invoiceId != null) {
                                                    ScaffoldMessenger.of(context).showSnackBar(
                                                      const SnackBar(content: Text('Memeriksa status pembayaran...'), duration: Duration(seconds: 1)),
                                                    );
                                                    final verifyRes = await provider.verifyTopUp(invoiceId);
                                                    if (verifyRes['success'] == true) {
                                                      final newStatus = verifyRes['status'];
                                                      ScaffoldMessenger.of(context).showSnackBar(
                                                        SnackBar(
                                                          content: Text(newStatus == 'paid'
                                                              ? 'Pembayaran Berhasil Terverifikasi! Saldo bertambah.'
                                                              : 'Pembayaran masih pending.'),
                                                          backgroundColor: newStatus == 'paid' ? Colors.green : Colors.amber,
                                                        ),
                                                      );
                                                    } else {
                                                      ScaffoldMessenger.of(context).showSnackBar(
                                                        SnackBar(
                                                          content: Text(verifyRes['error'] ?? 'Gagal memeriksa status.'),
                                                          backgroundColor: Colors.red,
                                                        ),
                                                      );
                                                    }
                                                  }
                                                },
                                                child: Container(
                                                  decoration: BoxDecoration(
                                                    color: const Color(0xFF3B82F6).withOpacity(0.1),
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  child: const Text(
                                                    'CEK',
                                                    style: TextStyle(
                                                      color: Color(0xFF3B82F6),
                                                      fontSize: 8,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ],
                                    ),
                                    Text(
                                      '+ ${fmtMoney(amount)}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF16A34A),
                                      ),
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
                const SizedBox(height: 16),

                // Inventory (DB-backed via member_items)
                const Text('Inventori', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: Colors.white,
                  surfaceTintColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: provider.inventory.isEmpty
                        ? const Column(
                            children: [
                              Icon(Icons.inventory_2_outlined, color: Colors.grey, size: 36),
                              SizedBox(height: 8),
                              Text('Inventori kosong.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              SizedBox(height: 4),
                              Text('Beli item di Toko Misi!', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: provider.inventory.length,
                            separatorBuilder: (_, __) => const Divider(color: Color(0xFFF1F5F9), height: 8),
                            itemBuilder: (context, i) {
                              final inv = provider.inventory[i];
                              final item = inv.item;
                              void showSnackBar(String message) {
                                ScaffoldMessenger.of(context).clearSnackBars();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    behavior: SnackBarBehavior.floating,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              }
                              return Row(
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: item.iconColor.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(item.icon, color: item.iconColor, size: 18),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                        Text('Tersedia: ${inv.quantity}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                      ],
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () async {
                                      if (item.id == 0) return;
                                      final msg = await provider.useInventoryItem(item.id);
                                      showSnackBar(msg);
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFACC15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text('PAKAI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                // Achievements (DB-backed via member_badges)
                const Text('Penghargaan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                SizedBox(
                  height: 120,
                  child: provider.earnedBadges.isEmpty
                      ? const Center(
                          child: Text('Belum ada penghargaan', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        )
                      : ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: provider.earnedBadges.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 12),
                          itemBuilder: (context, i) {
                            final badge = provider.earnedBadges[i];
                            return _buildAchievementIcon(
                              badge['name'] ?? 'Badge',
                              badge['description'] ?? '',
                              Icons.emoji_events,
                            );
                          },
                        ),
                ),
                const SizedBox(height: 20),

                // Pengaturan
                const Text('Pengaturan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                Card(
                  color: const Color(0xFF718096),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Column(
                    children: [
                      _buildSettingsTile('Keamanan & Password'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Notifikasi'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Metode Pembayaran'),
                      const Divider(color: Colors.white10, height: 1),
                      _buildSettingsTile('Pusat Bantuan'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: onLogout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Keluar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    ));
  }

  Widget _buildActiveLoanCard(Map<String, dynamic> loan) {
    final amount = (loan['amount'] as num?)?.toInt() ?? 0;
    final interestRate = (loan['interestRate'] as num?)?.toInt() ?? 0;
    final status = (loan['status'] as String?)?.toUpperCase() ?? 'PENDING';
    final dueDate = loan['dueDate'] != null
        ? DateTime.tryParse(loan['dueDate'].toString())
        : null;
    final dueDateStr = dueDate != null
        ? '${dueDate.day.toString().padLeft(2, '0')}/${dueDate.month.toString().padLeft(2, '0')}/${dueDate.year}'
        : 'Belum ditentukan';

    final statusColor = status == 'APPROVED'
        ? const Color(0xFF3B82F6)
        : status == 'PAID'
            ? const Color(0xFF16A34A)
            : const Color(0xFFF59E0B);

    String fmtMoney(int v) =>
        'Rp ${v.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.credit_card, color: Color(0xFF1E293B), size: 18),
                  SizedBox(width: 6),
                  Text(
                    'Status Pinjaman',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('TOTAL PINJAMAN', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 2),
                  Text(
                    fmtMoney(amount),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('BUNGA', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 2),
                  Text(
                    '$interestRate%',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFFDC2626)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.event, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(
                  'Jatuh tempo: $dueDateStr',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF1E293B), fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'BAYAR',
                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showBenefitSheet(BuildContext context, String rank) {
    final benefits = _getRankBenefits(rank);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Row(
              children: [
                const Icon(Icons.workspace_premium, color: Color(0xFFFACC15), size: 24),
                const SizedBox(width: 8),
                Text(
                  'Benefit Rank $rank',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...benefits.map((b) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, size: 16, color: Color(0xFF16A34A)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      b,
                      style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            )),
            const SizedBox(height: 8),
            Text(
              'Tingkatkan rank untuk membuka benefit eksklusif lainnya!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  List<String> _getRankBenefits(String rank) {
    switch (rank) {
      case 'Perunggu':
        return [
          'Bunga pinjaman standar',
          'Akses semua misi dasar',
          'Cashback belanja 0%',
        ];
      case 'Perak':
        return [
          'Bunga pinjaman -1%',
          'Prioritas layanan Silver',
          'Cashback belanja 5%',
          'Akses misi premium',
        ];
      case 'Emas':
        return [
          'Bunga pinjaman -2%',
          'Prioritas layanan Gold',
          'Cashback belanja 10%',
          'Bisa mengajukan proposal',
          'Bisa membuat event',
        ];
      case 'Platinum':
        return [
          'Bunga pinjaman -3%',
          'Prioritas layanan Platinum',
          'Cashback belanja 15%',
          'Limit pinjaman lebih tinggi',
        ];
      case 'Legenda':
        return [
          'Bunga pinjaman -5%',
          'Prioritas tertinggi',
          'Cashback belanja 20%',
          'Limit pinjaman maksimal',
          'Akses fitur eksklusif',
        ];
      default:
        return ['Benefit standar'];
    }
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
              boxShadow: isActive ? [BoxShadow(color: const Color(0xFFFACC15).withOpacity(0.3), blurRadius: 15)] : null,
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
    return Container(width: 24, height: 1.5, color: Colors.white10, margin: const EdgeInsets.symmetric(horizontal: 6));
  }

  Widget _buildAchievementIcon(String title, String desc, IconData icon, {double opacity = 1.0}) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: 128,
        decoration: BoxDecoration(color: const Color(0xFF718096), borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 36),
            const SizedBox(height: 8),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            Text(desc, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 8)),
          ],
        ),
      ),
    );
  }

  void _showTopUpDialog(BuildContext context, KoperasiProvider provider) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        int amount = 50000;
        bool isLoading = false;
        String? invoiceUrl;
        String? invoiceId;
        String? error;
        String? verificationStatus;

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Top Up Saldo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () {
                      Navigator.of(context).pop();
                      if (verificationStatus == 'paid') {
                        provider.fetchData();
                      }
                    },
                  ),
                ],
              ),
              content: SizedBox(
                width: 320,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (invoiceUrl == null) ...[
                      const Text(
                        'Masukkan jumlah saldo yang ingin Anda tambahkan.',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          prefixText: 'Rp ',
                          prefixStyle: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                          hintText: '50000',
                          hintStyle: const TextStyle(color: Colors.white30),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                        onChanged: (val) {
                          amount = int.tryParse(val) ?? 0;
                        },
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [20000, 50000, 100000].map((preset) {
                          return OutlinedButton(
                            onPressed: () {
                              setState(() {
                                amount = preset;
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: amount == preset ? const Color(0xFF3B82F6) : Colors.white24),
                              backgroundColor: amount == preset ? const Color(0xFF3B82F6).withOpacity(0.1) : null,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: Text(
                              'Rp ${preset ~/ 1000}k',
                              style: TextStyle(color: amount == preset ? const Color(0xFF3B82F6) : Colors.white70, fontSize: 11),
                            ),
                          );
                        }).toList(),
                      ),
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 11)),
                      ],
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: isLoading ? null : () async {
                          if (amount < 10000) {
                            setState(() {
                              error = 'Minimal top up adalah Rp 10.000';
                            });
                            return;
                          }
                          setState(() {
                            isLoading = true;
                            error = null;
                          });
                          final res = await provider.createTopUp(amount);
                          setState(() {
                            isLoading = false;
                          });
                          if (res['success'] == true) {
                            setState(() {
                              invoiceUrl = res['invoiceUrl'];
                              invoiceId = res['invoiceId'];
                            });
                            launchUrl(Uri.parse(invoiceUrl!), mode: LaunchMode.externalApplication);
                          } else {
                            setState(() {
                              error = res['error'] ?? 'Gagal membuat invoice.';
                            });
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          minimumSize: const Size(double.infinity, 44),
                        ),
                        child: isLoading
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Lanjutkan Pembayaran', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ] else ...[
                      const Icon(Icons.credit_card, color: Colors.blueAccent, size: 48),
                      const SizedBox(height: 12),
                      const Text('Invoice Pembayaran Dibuat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 6),
                      const Text('Invoice Xendit telah dibuka di tab baru.', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          children: [
                            const Text('Jumlah Top Up', style: TextStyle(color: Colors.white54, fontSize: 10)),
                            const SizedBox(height: 4),
                            Text(
                              'Rp ${amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                            ),
                          ],
                        ),
                      ),
                      if (error != null) ...[
                        const SizedBox(height: 12),
                        Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 11)),
                      ],
                      const SizedBox(height: 20),
                      if (verificationStatus == 'paid') ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green)),
                          child: const Row(
                            children: [
                              Icon(Icons.check_circle, color: Colors.green),
                              SizedBox(width: 10),
                              Text('Top Up Berhasil!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            provider.fetchData();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size(double.infinity, 44),
                          ),
                          child: const Text('Selesai', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ] else ...[
                        ElevatedButton(
                          onPressed: () {
                            launchUrl(Uri.parse(invoiceUrl!), mode: LaunchMode.externalApplication);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size(double.infinity, 44),
                          ),
                          child: const Text('Buka Kembali Pembayaran', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: isLoading ? null : () async {
                            setState(() {
                              isLoading = true;
                              error = null;
                            });
                            final res = await provider.verifyTopUp(invoiceId!);
                            setState(() {
                              isLoading = false;
                            });
                            if (res['success'] == true) {
                              if (res['status'] == 'paid') {
                                setState(() {
                                  verificationStatus = 'paid';
                                });
                              } else {
                                setState(() {
                                  error = 'Pembayaran belum terdeteksi. Silakan selesaikan pembayaran.';
                                });
                              }
                            } else {
                              setState(() {
                                error = res['error'] ?? 'Gagal memverifikasi pembayaran.';
                              });
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size(double.infinity, 44),
                          ),
                          child: isLoading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Cek Status Pembayaran', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ]
                    ]
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}