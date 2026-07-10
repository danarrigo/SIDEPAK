import 'package:flutter/material.dart';
import '../../providers/koperasi_provider.dart';

enum _LbScope { koperasi, provinsi, nasional }

extension on _LbScope {
  String get label {
    switch (this) {
      case _LbScope.koperasi:
        return 'Koperasi';
      case _LbScope.provinsi:
        return 'Provinsi';
      case _LbScope.nasional:
        return 'Nasional';
    }
  }
}

class LeaderboardSection extends StatefulWidget {
  final KoperasiProvider provider;
  const LeaderboardSection({required this.provider});

  @override
  State<LeaderboardSection> createState() => _LeaderboardSectionState();
}

class _LeaderboardSectionState extends State<LeaderboardSection> {
  _LbScope _scope = _LbScope.koperasi;

  List<Map<String, dynamic>> _getRows() {
    final p = widget.provider;
    final List<dynamic> raw;
    switch (_scope) {
      case _LbScope.koperasi:
        raw = p.leaderboardByKoperasi.isNotEmpty
            ? p.leaderboardByKoperasi
            : p.leaderboard;
        break;
      case _LbScope.provinsi:
        raw = p.leaderboardByProvinsi;
        break;
      case _LbScope.nasional:
        raw = p.leaderboardByNasional;
        break;
    }
    return raw
        .map<Map<String, dynamic>>((m) =>
            m is Map<String, dynamic> ? m : Map<String, dynamic>.from(m as Map))
        .toList();
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> m, int i) {
    final isMe = m['id'] == widget.provider.memberId;
    final medal = i == 0
        ? '🥇'
        : i == 1
            ? '🥈'
            : i == 2
                ? '🥉'
                : '#${i + 1}';
    return Container(
      decoration: BoxDecoration(
        color: isMe ? const Color(0xFFFEF9C3) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isMe ? const Color(0xFFFACC15) : Colors.grey.shade200,
          width: isMe ? 1.5 : 1,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: Text(
              medal,
              style: TextStyle(
                fontSize: i < 3 ? 18 : 12,
                fontWeight: FontWeight.bold,
                color: i < 3 ? null : const Color(0xFF64748B),
              ),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        m['namaLengkap'] ?? 'Anggota',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isMe ? FontWeight.w900 : FontWeight.bold,
                          color: const Color(0xFF1E293B),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isMe) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFACC15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'ANDA',
                          style: TextStyle(
                              fontSize: 7,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A)),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  'Level ${m['level'] ?? 1}',
                  style: const TextStyle(
                      fontSize: 10,
                      color: Colors.grey,
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Text(
            '${m['xp'] ?? 0} XP',
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFFF59E0B)),
          ),
        ],
      ),
    );
  }

  void _showFullLeaderboard(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final rows = _getRows();
        return Container(
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2)),
              ),
              const SizedBox(height: 16),
              Text(
                'Papan Peringkat ${_scope.label}',
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.separated(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: rows.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) =>
                      _buildLeaderboardItem(rows[i], i),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final rows = _getRows();
    final displayCount = rows.length > 3 ? 3 : rows.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Papan Peringkat',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF64748B)),
            ),
            if (rows.length > 3)
              GestureDetector(
                onTap: () => _showFullLeaderboard(context),
                child: const Text(
                  'Lihat Semua',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF3B82F6)),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.all(4),
          child: Row(
            children: _LbScope.values.map((s) {
              final isActive = s == _scope;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _scope = s),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isActive ? Colors.white : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: isActive
                          ? [
                              BoxShadow(
                                  color: Colors.black.withOpacity(0.06),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2))
                            ]
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        s.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isActive
                              ? const Color(0xFF0F172A)
                              : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        if (rows.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
              'Belum ada data peringkat untuk scope ${_scope.label.toLowerCase()}.',
              style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                  fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          )
        else
          GestureDetector(
            onTap: () => _showFullLeaderboard(context),
            child: AbsorbPointer(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: displayCount,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) => _buildLeaderboardItem(rows[i], i),
              ),
            ),
          ),
      ],
    );
  }
}
