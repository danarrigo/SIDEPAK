import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class MemberDetailView extends StatelessWidget {
  final Map<String, dynamic> member;
  const MemberDetailView({super.key, required this.member});

  String _initials(String name) {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'A';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final isMe = member['id'] == provider.memberId;
    final nama = member['namaLengkap']?.toString() ?? 'Anggota';
    final initials = _initials(nama);

    // Try to find member's rank in current leaderboard (for the profile card gradient)
    int? memberLevel;
    final inCoopLb = provider.leaderboardByKoperasi.where((m) => m['id'] == member['id']).toList();
    if (inCoopLb.isNotEmpty) {
      memberLevel = (inCoopLb.first['level'] as num?)?.toInt();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 220,
            backgroundColor: const Color(0xFF0F172A),
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.only(top: 60, left: 20, right: 20, bottom: 20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(color: const Color(0xFFFACC15), width: 3),
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nama,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: Text(
                              isMe ? 'ANDA' : 'ANGGOTA',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'No. ${member['nomorAnggota']?.toString() ?? '-'}',
                            style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                if (memberLevel != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFACC15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.workspace_premium, color: Color(0xFF0F172A)),
                        const SizedBox(width: 8),
                        Text(
                          'Level $memberLevel',
                          style: const TextStyle(
                            color: Color(0xFF0F172A),
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                _SectionCard(
                  title: 'Identitas',
                  children: [
                    _InfoRow(
                      icon: Icons.badge,
                      label: 'NIK',
                      value: member['nik']?.toString() ?? '-',
                    ),
                    _InfoRow(
                      icon: Icons.fingerprint,
                      label: 'No. Anggota',
                      value: member['nomorAnggota']?.toString() ?? '-',
                    ),
                    _InfoRow(
                      icon: Icons.check_circle,
                      label: 'Status',
                      value: (member['statusAnggota']?.toString() ?? 'active').toUpperCase(),
                      valueColor: (member['statusAnggota']?.toString() ?? 'active') == 'active'
                          ? const Color(0xFF16A34A)
                          : const Color(0xFFDC2626),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Domisili',
                  children: [
                    _InfoRow(
                      icon: Icons.map,
                      label: 'Provinsi',
                      value: member['provinsi']?.toString() ?? '-',
                    ),
                    _InfoRow(
                      icon: Icons.location_city,
                      label: 'Kabupaten',
                      value: member['kabupaten']?.toString() ?? '-',
                    ),
                    _InfoRow(
                      icon: Icons.account_balance,
                      label: 'Kecamatan',
                      value: member['kecamatan']?.toString() ?? '-',
                    ),
                    _InfoRow(
                      icon: Icons.location_on,
                      label: 'Desa/Kelurahan',
                      value: member['desa']?.toString() ?? '-',
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Koperasi',
                  children: [
                    _InfoRow(
                      icon: Icons.business,
                      label: 'Koperasi',
                      value: member['koperasi']?.toString() ?? 'Koperasi Desa',
                    ),
                  ],
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF64748B)),
          const SizedBox(width: 10),
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: valueColor ?? const Color(0xFF1E293B),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
