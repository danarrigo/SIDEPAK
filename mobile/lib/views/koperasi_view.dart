import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'members_directory_view.dart';

class KoperasiView extends StatelessWidget {
  const KoperasiView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    final mainProposal =
        provider.activeProposals.isNotEmpty ? provider.activeProposals[0] : null;
    final proposalTitle = mainProposal != null
        ? (mainProposal['title'] ?? 'Tanpa Judul')
        : 'Belum ada agenda aktif';
    final proposalDesc = mainProposal != null
        ? (mainProposal['description'] ?? '')
        : 'Saat ini tidak ada proposal yang sedang dalam masa voting.';

    String fmtNum(int v) =>
        'Rp ${v.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}';

    final totalAset = provider.totalAsetDesa > 0 ? provider.totalAsetDesa : 0;
    final kasPct = totalAset > 0 ? (provider.asetKas / totalAset * 100).round() : 0;
    final pinjamanPct = totalAset > 0 ? (provider.asetPinjaman / totalAset * 100).round() : 0;
    final investasiPct = totalAset > 0 ? (provider.asetInvestasi / totalAset * 100).round() : 0;

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: const Color(0xFF111827),
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 30),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Dashboard Koperasi', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                Text('Koperasi Merah Putih Desa Sukamaju', style: TextStyle(color: Colors.white60, fontSize: 12))
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top stats (DB-backed)
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
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Statistik Koperasi', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const MembersDirectoryView()),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white30),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Lihat Anggota',
                                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                    SizedBox(width: 2),
                                    Icon(Icons.arrow_forward, color: Colors.white, size: 12),
                                  ],
                                ),
                              ),
                            ),
                          ],
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
                            _buildWhiteStatCard('Total Anggota', '${provider.totalMembers}', 'Terdaftar aktif'),
                            _buildWhiteStatCard('Total Transaksi', '${provider.kopTransaksi}', 'Simpanan & Pinjaman'),
                            _buildWhiteStatCard('Total Aset Desa', fmtNum(provider.totalAsetDesa), 'Konsolidasi'),
                            _buildWhiteStatCard('UMKM Aktif', provider.kopUmkm > 0 ? '${provider.kopUmkm}' : '-', 'Data UMKM'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Asset distribution (DB-backed, replaces trust gauges)
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
                        const Text(
                          'Distribusi Aset Desa',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 16),
                        _buildAsetBar('Kas & Likuiditas', kasPct, fmtNum(provider.asetKas), const Color(0xFF3B82F6)),
                        const SizedBox(height: 12),
                        _buildAsetBar('Pinjaman Anggota', pinjamanPct, fmtNum(provider.asetPinjaman), const Color(0xFFF59E0B)),
                        const SizedBox(height: 12),
                        _buildAsetBar('Investasi & Lainnya', investasiPct, fmtNum(provider.asetInvestasi), const Color(0xFFEF4444)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Voting E-RAT (DB-backed, real proposal title)
                const Row(
                  children: [
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
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Agenda E-RAT Aktif',
                            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          if (mainProposal != null) _buildSisaWaktu(mainProposal),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        proposalTitle,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.3),
                      ),
                      if (proposalDesc.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          proposalDesc,
                          style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                        ),
                      ],
                      if (mainProposal != null && mainProposal['targetQuorumPercentage'] != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'TARGET QUORUM',
                                style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
                              ),
                              Text(
                                '${mainProposal['targetQuorumPercentage']}%',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      if (provider.voteSelection != null)
                        Container(
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.greenAccent, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'Pilihan Anda: ${provider.voteSelection}',
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      else if (mainProposal != null) ...[
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _showVoteConfirmation(context, 'Setuju', proposalTitle),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF16A34A),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Setuju', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _showVoteConfirmation(context, 'Tolak', proposalTitle),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFDC2626),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Tolak', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _showVoteConfirmation(context, 'Abstain', proposalTitle),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white24,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Abstain', style: TextStyle(color: Colors.white, fontSize: 11)),
                              ),
                            ),
                          ],
                        ),
                      ] else
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            'Belum ada vote yang aktif. Ajukan proposal baru di bawah.',
                            style: TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Submit Proposal (gated at Level 20+ = Emas)
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
                        const Text(
                          'Ajukan Proposal Desa',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Suarakan ide Anda untuk kemajuan bersama.',
                          style: TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                        const SizedBox(height: 12),
                        if (provider.canSubmitProposal)
                          const _ProposalForm()
                        else
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                            ),
                            child: Column(
                              children: [
                                const Icon(Icons.lock, color: Colors.grey, size: 32),
                                const SizedBox(height: 6),
                                Text(
                                  'Pengajuan proposal hanya untuk anggota Level 20 (Emas) ke atas.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: Color(0xFF475569), fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Level Anda saat ini: ${provider.level} (${provider.rankName})',
                                  style: const TextStyle(color: Colors.grey, fontSize: 10),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Arsip Keputusan (real pastProposals)
                const Text('Arsip Keputusan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 8),
                provider.pastProposals.isEmpty
                    ? Container(
                        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: const Text(
                          'Belum ada riwayat proposal.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: provider.pastProposals.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, i) {
                          final p = provider.pastProposals[i];
                          final status = p['status'] ?? '';
                          final isPassed = status == 'passed';
                          final isRejected = status == 'rejected';
                          final badgeBg = isPassed
                              ? const Color(0xFFDCFCE7)
                              : isRejected
                                  ? const Color(0xFFFEE2E2)
                                  : const Color(0xFFF1F5F9);
                          final badgeText = isPassed
                              ? const Color(0xFF16A34A)
                              : isRejected
                                  ? const Color(0xFFEF4444)
                                  : const Color(0xFF64748B);
                          final badgeLabel = isPassed
                              ? 'Disetujui'
                              : isRejected
                                  ? 'Ditolak'
                                  : status.toString();
                          final endDate = p['endDate']?.toString().split('T')[0] ?? '';
                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        p['title'] ?? '',
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(color: badgeBg, borderRadius: BorderRadius.circular(6)),
                                      child: Text(
                                        badgeLabel,
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: badgeText),
                                      ),
                                    ),
                                  ],
                                ),
                                if ((p['description'] ?? '').isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    p['description'] ?? '',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  ),
                                ],
                                const SizedBox(height: 6),
                                Text(
                                  'Berakhir: $endDate',
                                  style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                const SizedBox(height: 20),
              ],
            ),
          )
        ],
      ),
    ));
  }

  Widget _buildSisaWaktu(Map<String, dynamic> proposal) {
    final end = proposal['endDate'];
    if (end == null) return const SizedBox.shrink();
    final endDate = DateTime.tryParse(end.toString());
    if (endDate == null) return const SizedBox.shrink();
    final diff = endDate.difference(DateTime.now());
    final days = diff.inDays;
    final hours = diff.inHours % 24;
    String label;
    if (diff.isNegative) {
      label = 'Selesai';
    } else if (days >= 1) {
      label = '$days hari ${hours}j lagi';
    } else {
      label = '${diff.inHours}j ${diff.inMinutes % 60}m lagi';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.timer, size: 10, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildWhiteStatCard(String label, String val, String subText) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(val, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
          const SizedBox(height: 2),
          Text(
            subText,
            style: const TextStyle(fontSize: 8, color: Color(0xFF16A34A), fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildAsetBar(String label, int pct, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            Text('$pct%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: (pct / 100).clamp(0.0, 1.0),
            minHeight: 6,
            backgroundColor: const Color(0xFFCBD5E1),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          textAlign: TextAlign.right,
          style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  void _showVoteConfirmation(BuildContext context, String choice, String proposalTitle) {
    final provider = context.read<KoperasiProvider>();

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
            'Apakah Anda yakin ingin memberikan suara "$choice" pada agenda "$proposalTitle"? Pilihan dapat diubah jika Anda memilih ulang.',
            style: const TextStyle(color: Color(0xFF475569), fontSize: 14, height: 1.4),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                final msg = await provider.submitVote(choice);
                showSnackBar(msg);
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

class _ProposalForm extends StatefulWidget {
  const _ProposalForm();

  @override
  State<_ProposalForm> createState() => _ProposalFormState();
}

class _ProposalFormState extends State<_ProposalForm> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.read<KoperasiProvider>();
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _titleCtrl,
          decoration: InputDecoration(
            labelText: 'Judul Proposal',
            labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          style: const TextStyle(fontSize: 12),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _descCtrl,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: 'Deskripsi Detail',
            labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          style: const TextStyle(fontSize: 12),
        ),
        const SizedBox(height: 12),
        ElevatedButton(
          onPressed: _busy
              ? null
              : () async {
                  if (_titleCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) {
                    showSnackBar('Judul dan deskripsi wajib diisi.');
                    return;
                  }
                  setState(() => _busy = true);
                  final msg = await provider.submitProposal(_titleCtrl.text.trim(), _descCtrl.text.trim());
                  setState(() => _busy = false);
                  showSnackBar(msg);
                  if (msg.contains('berhasil')) {
                    _titleCtrl.clear();
                    _descCtrl.clear();
                  }
                },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          child: _busy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Text('AJUKAN PROPOSAL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
        ),
      ],
    );
  }
}