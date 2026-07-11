import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class HealthScoreView extends StatelessWidget {
  const HealthScoreView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();

    return RefreshIndicator(
      onRefresh: () => provider.fetchData(),
      color: const Color(0xFF0F172A),
      backgroundColor: Colors.white,
      child: Container(
        color: const Color(0xFFF1F5F9),
        height: double.infinity,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding:
              const EdgeInsets.only(top: 50, left: 16, right: 16, bottom: 32),
          child: provider.healthScore == null
              ? _buildEmptyState(provider)
              : _buildContent(context, provider),
        ),
      ),
    );
  }

  Widget _buildEmptyState(KoperasiProvider provider) {
    return SizedBox(
      height: 500,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withOpacity(0.08),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.monitor_heart_outlined,
                color: Color(0xFF0F172A), size: 36),
          ),
          const SizedBox(height: 20),
          const Text(
            'Data Kesehatan Belum Tersedia',
            style: TextStyle(
                color: Color(0xFF0F172A),
                fontSize: 16,
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Fitur ini hanya tersedia untuk pengurus koperasi.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, KoperasiProvider provider) {
    final hs = provider.healthScore!;
    final score = (hs['healthScore'] as num?)?.toInt() ?? 0;
    final label = hs['healthLabel'] as String? ?? 'Waspada';
    final coopName = hs['cooperativeName'] as String? ?? '';
    final dimensions = (hs['dimensions'] as List<dynamic>?) ?? [];

    final labelColor = label == 'Sehat'
        ? const Color(0xFF22C55E)
        : label == 'Waspada'
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);
    final labelBg = label == 'Sehat'
        ? const Color(0xFFDCFCE7)
        : label == 'Waspada'
            ? const Color(0xFFFEF3C7)
            : const Color(0xFFFEE2E2);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.only(top: 16, bottom: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MONITOR KESEHATAN',
                style: const TextStyle(
                  color: Color(0xFFFACC15),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Skor Kesehatan Koperasi',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 22,
                    fontWeight: FontWeight.w900),
              ),
              if (coopName.isNotEmpty)
                Text(
                  coopName,
                  style:
                      const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                ),
            ],
          ),
        ),

        // Gauge Card
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(28),
          child: Column(
            children: [
              _buildGauge(score, labelColor),
              const SizedBox(height: 16),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                decoration: BoxDecoration(
                  color: labelBg,
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: labelColor.withOpacity(0.3)),
                ),
                child: Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    color: labelColor,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _getLabelDescription(label),
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: Color(0xFF64748B), fontSize: 12, height: 1.5),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Formula Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'FORMULA SKOR',
                style: TextStyle(
                    color: Color(0xFFFACC15),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                dimensions.map((d) {
                  final rawScore = (d['score'] as num?) ?? 0;
                  return '${(rawScore * 100).toStringAsFixed(0)} × ${d['weight']}%';
                }).join(' + '),
                style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                    fontFamily: 'monospace'),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Text('= ',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  Text('$score',
                      style: const TextStyle(
                          color: Color(0xFFFACC15),
                          fontSize: 22,
                          fontWeight: FontWeight.w900)),
                  const Text(' / 100',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Dimensions Header
        const Text(
          'Rincian 5 Dimensi Kesehatan',
          style: TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        const Text(
          'Hover pada tiap kartu untuk keterangan lengkap.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
        ),
        const SizedBox(height: 12),

        // Dimension Cards
        ...dimensions.map((dim) => _buildDimensionCard(dim)).toList(),

        const SizedBox(height: 24),

        _buildRecommendationsSection(dimensions),

        const SizedBox(height: 24),

        // Weight Chart
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Kontribusi Per Dimensi',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 14,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ...dimensions.map((dim) => _buildWeightBar(dim)).toList(),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Threshold guide
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Panduan Interpretasi',
                style: TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 14,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildThresholdItem(
                  const Color(0xFF22C55E),
                  const Color(0xFFDCFCE7),
                  'Sehat (≥60)',
                  'Koperasi beroperasi optimal. Kepatuhan iuran tinggi, anggota aktif, governance berjalan.'),
              const SizedBox(height: 8),
              _buildThresholdItem(
                  const Color(0xFFF59E0B),
                  const Color(0xFFFEF3C7),
                  'Waspada (35–59)',
                  'Perlu perhatian. Ada dimensi lemah — identifikasi dan intervensi sebelum memburuk.'),
              const SizedBox(height: 8),
              _buildThresholdItem(
                  const Color(0xFFEF4444),
                  const Color(0xFFFEE2E2),
                  'Kritis (<35)',
                  'Memerlukan tindakan segera. Mayoritas dimensi di bawah ambang batas minimal.'),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Methodology note
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: const Color(0xFFE2E8F0), style: BorderStyle.solid),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline,
                  color: Color(0xFF94A3B8), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: const Text(
                  'Diadaptasi dari metodologi Simkopdes Health Score (1.026 koperasi) menggunakan prinsip Structural Spirit Preservation.',
                  style: TextStyle(
                      color: Color(0xFF64748B), fontSize: 11, height: 1.5),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGauge(int score, Color color) {
    return SizedBox(
      width: 180,
      height: 180,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: const Size(180, 180),
            painter: _GaugePainter(score: score, color: color),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$score',
                style: TextStyle(
                  color: const Color(0xFF0F172A),
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Text(
                '/ 100',
                style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 13,
                    fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDimensionCard(Map<String, dynamic> dim) {
    final score = ((dim['score'] as num?) ?? 0).toDouble();
    final pct = (score * 100).toInt();
    final color = _hexToColor(dim['color'] as String? ?? '#64748B');
    final weightedScore = ((dim['weightedScore'] as num?) ?? 0);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _iconForKey(dim['key'] as String? ?? ''),
                  color: color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dim['label'] as String? ?? '',
                      style: const TextStyle(
                          color: Color(0xFF0F172A),
                          fontSize: 14,
                          fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Bobot ${dim['weight']}%',
                      style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$pct',
                    style: TextStyle(
                        color: const Color(0xFF0F172A),
                        fontSize: 22,
                        fontWeight: FontWeight.w900),
                  ),
                  Text(
                    'Kontribusi: ${(weightedScore * 100).toInt()}pts',
                    style: TextStyle(
                        color: color,
                        fontSize: 10,
                        fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: score,
              minHeight: 8,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            dim['description'] as String? ?? '',
            style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
                fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            dim['detail'] as String? ?? '',
            style: const TextStyle(
                color: Color(0xFF94A3B8), fontSize: 11, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildWeightBar(Map<String, dynamic> dim) {
    final score = ((dim['score'] as num?) ?? 0).toDouble();
    final weight = ((dim['weight'] as num?) ?? 0).toInt();
    final color = _hexToColor(dim['color'] as String? ?? '#64748B');
    final actualContrib = (score * weight).toInt();

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                dim['label'] as String? ?? '',
                style: const TextStyle(
                    color: Color(0xFF0F172A),
                    fontSize: 12,
                    fontWeight: FontWeight.w600),
              ),
              Text(
                '$actualContrib / $weight pts',
                style: TextStyle(
                    color: color, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Stack(
            children: [
              Container(
                  height: 10,
                  decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(5))),
              FractionallySizedBox(
                widthFactor:
                    actualContrib / 35.0, // normalized against max weight (35)
                child: Container(
                  height: 10,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(5),
                    boxShadow: [
                      BoxShadow(color: color.withOpacity(0.4), blurRadius: 4)
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildThresholdItem(Color color, Color bg, String label, String desc) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
              width: 10,
              height: 10,
              margin: const EdgeInsets.only(top: 3),
              decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        color: color,
                        fontSize: 12,
                        fontWeight: FontWeight.w900)),
                const SizedBox(height: 2),
                Text(desc,
                    style: TextStyle(
                        color: color.withOpacity(0.8),
                        fontSize: 11,
                        height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getLabelDescription(String label) {
    if (label == 'Sehat')
      return 'Koperasi Anda beroperasi optimal.\nKepatuhan iuran tinggi, anggota aktif, governance berjalan dengan baik.';
    if (label == 'Waspada')
      return 'Koperasi memerlukan perhatian.\nIdentifikasi dimensi yang lemah dan lakukan intervensi sebelum kondisi memburuk.';
    return 'Koperasi memerlukan tindakan segera.\nMayoritas dimensi di bawah ambang batas minimal operasional.';
  }

  IconData _iconForKey(String key) {
    switch (key) {
      case 'd1':
        return Icons.payments_outlined;
      case 'd2':
        return Icons.devices_outlined;
      case 'd3':
        return Icons.how_to_vote_outlined;
      case 'd4':
        return Icons.account_balance_outlined;
      case 'd5':
        return Icons.local_fire_department_outlined;
      default:
        return Icons.bar_chart;
    }
  }

  Widget _buildRecommendationsSection(List<dynamic> dimensions) {
    final lowDims =
        dimensions.where((d) => ((d['score'] as num?) ?? 0) < 0.6).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Rekomendasi Peningkatan Kinerja Koperasi',
          style: TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (lowDims.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: const Color(0xFF22C55E).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_rounded,
                    color: Color(0xFF22C55E), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Kinerja Seluruh Dimensi Optimal!',
                        style: TextStyle(
                            color: Color(0xFF15803D),
                            fontSize: 13,
                            fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Koperasi Anda berada dalam kondisi optimal di seluruh dimensi penilaian (skor ≥ 60%). Pertahankan transparansi dan keaktifan ini.',
                        style: TextStyle(
                            color: Color(0xFF166534),
                            fontSize: 11,
                            height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )
        else
          ...lowDims.map((d) {
            final key = d['key'] as String? ?? '';
            final scorePct = (((d['score'] as num?) ?? 0) * 100).round();

            final Map<String, Map<String, dynamic>> recommendations = {
              'd1': {
                'title': 'Kepatuhan Iuran Rendah',
                'action': 'Optimalkan Penagihan & Keuangan',
                'tips': [
                  'Kirim notifikasi tagihan atau pasang reminder otomatis di n8n untuk iuran bulanan.',
                  'Sediakan kemudahan metode pembayaran digital (autodebet/e-wallet).',
                  'Lakukan komunikasi personal khusus anggota dengan tunggakan di atas 3 bulan.'
                ]
              },
              'd2': {
                'title': 'Penetrasi Digital Rendah',
                'action': 'Gencarkan Aktivasi Aplikasi SIDEPAK',
                'tips': [
                  'Bantu proses onboarding dan pembuatan akun SIDEPAK saat pertemuan bulanan/RAT.',
                  'Berikan insentif Poin perdana (Welcome Reward) setelah aktivasi akun pertama.',
                  'Buat panduan pendaftaran sederhana dalam format pamflet atau video singkat.'
                ]
              },
              'd3': {
                'title': 'Partisipasi Governance Rendah',
                'action': 'Tingkatkan Keaktifan Pengambilan Keputusan',
                'tips': [
                  'Buat proposal/kebijakan baru yang secara riil berdampak langsung ke kesejahteraan anggota.',
                  'Beri apresiasi berupa XP/Poin kecil kepada anggota setelah memberikan suara/voting.',
                  'Sederhanakan bahasa penulisan proposal agar lebih ringkas dan mudah dipahami.'
                ]
              },
              'd4': {
                'title': 'Rasio Kredit Macet Tinggi',
                'action': 'Perketat Manajemen Risiko Kredit',
                'tips': [
                  'Lakukan uji kelayakan kredit (credit scoring) lebih mendalam sebelum menyetujui pinjaman baru.',
                  'Tawarkan skema restrukturisasi pembayaran/penjadwalan ulang cicilan bagi anggota yang kesulitan.',
                  'Kirim pengingat tagihan ramah melalui sistem 3 hari sebelum tanggal jatuh tempo.'
                ]
              },
              'd5': {
                'title': 'Keaktifan Gamifikasi Rendah',
                'action': 'Dongkrak Partisipasi & Event Liga',
                'tips': [
                  'Perbarui daftar Quest Mingguan dengan tantangan yang mudah namun mengasyikkan.',
                  'Dorong partisipasi aktif anggota pada Liga Koperasi untuk mengumpulkan skor tim.',
                  'Sediakan merchandise atau sembako murah di Toko Poin sebagai penukar Poin SIDEPAK.'
                ]
              }
            };

            final rec = recommendations[key];
            if (rec == null) return const SizedBox.shrink();

            final tipsList = List<String>.from(rec['tips'] as List);

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(16),
                border:
                    Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded,
                              color: Color(0xFFD97706), size: 18),
                          const SizedBox(width: 6),
                          Text(
                            rec['title'] as String,
                            style: const TextStyle(
                              color: Color(0xFF92400E),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Skor: $scorePct%',
                          style: const TextStyle(
                              color: Color(0xFFB45309),
                              fontSize: 9,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFFEF3C7), height: 16),
                  Text(
                    rec['action'] as String,
                    style: const TextStyle(
                        color: Color(0xFF1E293B),
                        fontSize: 13,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...tipsList
                      .map((tip) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('• ',
                                    style: TextStyle(
                                        color: Color(0xFFF59E0B),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12)),
                                Expanded(
                                  child: Text(
                                    tip,
                                    style: const TextStyle(
                                        color: Color(0xFF475569),
                                        fontSize: 11,
                                        height: 1.4),
                                  ),
                                ),
                              ],
                            ),
                          ))
                      .toList(),
                ],
              ),
            );
          }).toList(),
      ],
    );
  }

  Color _hexToColor(String hex) {
    final h = hex.replaceAll('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}

class _GaugePainter extends CustomPainter {
  final int score;
  final Color color;

  _GaugePainter({required this.score, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;
    const startAngle = -3.14159 / 2; // -90 degrees (top)
    final sweepAngle = 2 * 3.14159 * (score / 100);

    // Background track
    final trackPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, trackPaint);

    // Score arc
    final scorePaint = Paint()
      ..color = color
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      scorePaint,
    );
  }

  @override
  bool shouldRepaint(_GaugePainter oldDelegate) =>
      oldDelegate.score != score || oldDelegate.color != color;
}
