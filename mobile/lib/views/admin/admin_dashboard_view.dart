import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/koperasi_provider.dart';

class AdminDashboardView extends StatelessWidget {
  const AdminDashboardView({super.key});

  int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val) ?? 0;
    return 0;
  }

  String _formatRupiah(int amount) {
    String res = amount.toString();
    String formatted = '';
    for (int i = 0; i < res.length; i++) {
      if (i > 0 && i % 3 == 0) {
        formatted = '.$formatted';
      }
      formatted = res[res.length - 1 - i] + formatted;
    }
    return 'Rp $formatted';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final stats = provider.adminStats ?? {};

    final totalMembers = _toInt(stats['totalMembers']);
    final activeMembers = _toInt(stats['activeMembers']);
    final totalActiveLoans = _toInt(stats['totalActiveLoans']);
    final totalAssets = _toInt(stats['totalAssets']);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: const Color(0xFFF1F5F9),
            elevation: 0,
            pinned: true,
            expandedHeight: 80,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Text(
                'Dashboard Pengurus',
                style: const TextStyle(
                  color: Color(0xFF0F172A),
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFACC15).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.admin_panel_settings_rounded,
                            color: Color(0xFFFACC15),
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Selamat datang,',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                provider.fullName ?? 'Pengurus',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Metrik Koperasi',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildMetricCard(
                    title: 'Total Anggota',
                    value: totalMembers.toString(),
                    icon: Icons.groups_rounded,
                    color: const Color(0xFFFACC15),
                  ),
                  const SizedBox(height: 12),
                  _buildMetricCard(
                    title: 'Anggota Aktif',
                    subtitle: 'Lunas Simpanan Pokok',
                    value: activeMembers.toString(),
                    icon: Icons.verified_user_rounded,
                    color: Colors.teal,
                  ),
                  const SizedBox(height: 12),
                  _buildMetricCard(
                    title: 'Pinjaman Aktif',
                    value: _formatRupiah(totalActiveLoans),
                    icon: Icons.payments_rounded,
                    color: Colors.amber,
                  ),
                  const SizedBox(height: 12),
                  _buildMetricCard(
                    title: 'Total Aset Koperasi',
                    value: _formatRupiah(totalAssets),
                    icon: Icons.account_balance_rounded,
                    color: Colors.blue,
                  ),
                  const SizedBox(height: 24),
                  if (stats['loansByStatus'] != null) ...[
                    _buildLoansPieChart(stats['loansByStatus']),
                    const SizedBox(height: 24),
                  ],
                  _buildCashFlowBarChart(totalAssets, totalActiveLoans),
                  const SizedBox(height: 24),
                  const Text(
                    'Menunggu Persetujuan',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildPendingApprovals(stats),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    String? subtitle,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -10,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 16),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Colors.grey,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoansPieChart(List<dynamic> loansData) {
    if (loansData.isEmpty) {
      return const SizedBox.shrink();
    }

    int totalPending = 0;
    int totalApproved = 0;
    int totalPaid = 0;
    int totalDefaulted = 0;

    for (var loan in loansData) {
      final status = loan['status'];
      final count = loan['count'] ?? 0;
      if (status == 'pending')
        totalPending += _toInt(count);
      else if (status == 'approved')
        totalApproved += _toInt(count);
      else if (status == 'paid')
        totalPaid += _toInt(count);
      else if (status == 'defaulted') totalDefaulted += _toInt(count);
    }

    final total = totalPending + totalApproved + totalPaid + totalDefaulted;
    if (total == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Status Pinjaman (Jumlah)',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                sections: [
                  if (totalApproved > 0)
                    PieChartSectionData(
                      color: Colors.amber,
                      value: totalApproved.toDouble(),
                      title:
                          '${(totalApproved / total * 100).toStringAsFixed(0)}%',
                      radius: 50,
                      titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  if (totalPaid > 0)
                    PieChartSectionData(
                      color: Colors.teal,
                      value: totalPaid.toDouble(),
                      title: '${(totalPaid / total * 100).toStringAsFixed(0)}%',
                      radius: 50,
                      titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  if (totalPending > 0)
                    PieChartSectionData(
                      color: Colors.grey,
                      value: totalPending.toDouble(),
                      title:
                          '${(totalPending / total * 100).toStringAsFixed(0)}%',
                      radius: 50,
                      titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  if (totalDefaulted > 0)
                    PieChartSectionData(
                      color: Colors.redAccent,
                      value: totalDefaulted.toDouble(),
                      title:
                          '${(totalDefaulted / total * 100).toStringAsFixed(0)}%',
                      radius: 50,
                      titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 12,
            runSpacing: 8,
            children: [
              if (totalApproved > 0)
                _buildLegend(Colors.amber, 'Aktif ($totalApproved)'),
              if (totalPaid > 0)
                _buildLegend(Colors.teal, 'Lunas ($totalPaid)'),
              if (totalPending > 0)
                _buildLegend(Colors.grey, 'Menunggu ($totalPending)'),
              if (totalDefaulted > 0)
                _buildLegend(Colors.redAccent, 'Macet ($totalDefaulted)'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  Widget _buildCashFlowBarChart(int totalAssets, int totalLoans) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Komposisi Kas (Aset vs Pinjaman)',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: (totalAssets > totalLoans ? totalAssets : totalLoans)
                        .toDouble() *
                    1.2,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            value.toInt() == 0
                                ? 'Aset Total'
                                : 'Pinjaman Aktif',
                            style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: [
                  BarChartGroupData(
                    x: 0,
                    barRods: [
                      BarChartRodData(
                        toY: totalAssets.toDouble(),
                        color: Colors.blue,
                        width: 40,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ],
                  ),
                  BarChartGroupData(
                    x: 1,
                    barRods: [
                      BarChartRodData(
                        toY: totalLoans.toDouble(),
                        color: Colors.amber,
                        width: 40,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingApprovals(Map<String, dynamic> stats) {
    final pendingProposals = stats['pendingProposals'] as List<dynamic>? ?? [];
    final pendingEvents = stats['pendingEvents'] as List<dynamic>? ?? [];
    final pendingLoans = stats['pendingLoans'] as List<dynamic>? ?? [];
    final totalPending =
        pendingProposals.length + pendingEvents.length + pendingLoans.length;

    if (totalPending == 0) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border:
              Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
        ),
        child: Column(
          children: [
            Icon(Icons.task_rounded, size: 48, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            const Text(
              'Belum ada pengajuan baru yang perlu diproses hari ini.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ],
        ),
      );
    }

    String _formatDate(String? isoString) {
      if (isoString == null) return '';
      try {
        final date = DateTime.parse(isoString);
        return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
      } catch (e) {
        return '';
      }
    }

    String _formatMoney(int v) =>
        'Rp ${v.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (pendingProposals.isNotEmpty) ...[
          const Text('Proposal Program (Voting)',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey)),
          const SizedBox(height: 8),
          ...pendingProposals.map((item) => _buildApprovalCard(
                title: item['title'] ?? 'Proposal',
                subtitle: 'Oleh: ${item['authorName'] ?? 'Anggota'}',
                date: _formatDate(item['createdAt']),
                icon: Icons.how_to_vote_rounded,
                iconColor: Colors.blue,
                tag: 'PROPOSAL',
              )),
          const SizedBox(height: 16),
        ],
        if (pendingEvents.isNotEmpty) ...[
          const Text('Pengajuan Event / Kegiatan',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey)),
          const SizedBox(height: 8),
          ...pendingEvents.map((item) => _buildApprovalCard(
                title: item['name'] ?? 'Event',
                subtitle: 'Oleh: ${item['creatorName'] ?? 'Anggota'}',
                date: _formatDate(item['createdAt']),
                icon: Icons.event_rounded,
                iconColor: Colors.purple,
                tag: 'EVENT',
              )),
          const SizedBox(height: 16),
        ],
        if (pendingLoans.isNotEmpty) ...[
          const Text('Pengajuan Pinjaman',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey)),
          const SizedBox(height: 8),
          ...pendingLoans.map((item) => _buildApprovalCard(
                title: _formatMoney(_toInt(item['amount'])),
                subtitle: 'Pemohon: ${item['memberName'] ?? 'Anggota'}',
                date: _formatDate(item['createdAt']),
                icon: Icons.payments_rounded,
                iconColor: Colors.amber,
                tag: 'PINJAMAN',
              )),
          const SizedBox(height: 16),
        ],
      ],
    );
  }

  Widget _buildApprovalCard({
    required String title,
    required String subtitle,
    required String date,
    required IconData icon,
    required Color iconColor,
    required String tag,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(tag,
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: iconColor,
                            letterSpacing: 1)),
                    Text(date,
                        style:
                            const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(title,
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(subtitle,
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, color: Colors.grey),
        ],
      ),
    );
  }
}
