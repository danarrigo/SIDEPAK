import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class KoperasiView extends StatelessWidget {
  const KoperasiView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

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

    return SingleChildScrollView(
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
                        const Text('Statistik Bulan Ini', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.5,
                          children: [
                            _buildWhiteStatCard('Total Anggota', '${provider.kopAnggotaBaru}', '+${provider.kopAnggotaBaru} Terdaftar'),
                            _buildWhiteStatCard('Total Transaksi', '${provider.kopTransaksi}', 'Simpanan & Pinjaman'),
                            _buildWhiteStatCard('SHU Berjalan', 'Estimasi', 'Menunggu Data', italic: true),
                            _buildWhiteStatCard('Omzet Harian', provider.kopOmzet > 0 ? 'Rp ${provider.kopOmzet}Jt' : '-', '+${provider.kopUmkm} UMKM Aktif'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
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
                            const Text('Tingkat Kepercayaan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                border: Border.all(color: const Color(0xFF86EFAC)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              child: const Text('Sangat baik', style: TextStyle(color: Color(0xFF16A34A), fontSize: 9, fontWeight: FontWeight.bold)),
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
                      const Text(
                        'Agenda E-RAT',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        provider.activeProposals.isNotEmpty
                            ? provider.activeProposals[0]['title'] ?? 'Belum ada agenda aktif'
                            : 'Belum ada agenda aktif',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                      ),
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
                      else ...[
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _showVoteConfirmation(context, 'Setuju'),
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
                                onPressed: () => _showVoteConfirmation(context, 'Tolak'),
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
                                onPressed: () => _showVoteConfirmation(context, 'Abstain'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white24,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Abstain', style: TextStyle(color: Colors.white, fontSize: 11)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1F2937),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Linimasa Keputusan', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(val, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
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
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(16)),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: bgBadge, borderRadius: BorderRadius.circular(8)),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            child: Text(badge, style: TextStyle(color: textBadge, fontSize: 8, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _showVoteConfirmation(BuildContext context, String choice) {
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
                provider.submitVote(choice, showSnackBar);
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
