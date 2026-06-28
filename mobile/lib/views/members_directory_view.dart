import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'member_detail_view.dart';

class MembersDirectoryView extends StatelessWidget {
  const MembersDirectoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final members = provider.activeMembers;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Daftar Anggota',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchData(),
        child: members.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 80),
                  Center(
                    child: Column(
                      children: [
                        Icon(Icons.group_outlined, color: Colors.grey, size: 48),
                        SizedBox(height: 12),
                        Text(
                          'Belum ada anggota aktif.',
                          style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              )
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: members.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final m = members[i];
                  final isMe = m['id'] == provider.memberId;
                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => MemberDetailView(member: m),
                        ),
                      );
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isMe ? const Color(0xFFFEF9C3) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isMe ? const Color(0xFFFACC15) : const Color(0xFFE2E8F0),
                          width: isMe ? 1.5 : 1,
                        ),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: isMe ? const Color(0xFFFACC15) : const Color(0xFF0F172A),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                _initials(m['namaLengkap']?.toString() ?? 'A'),
                                style: TextStyle(
                                  color: isMe ? const Color(0xFF0F172A) : Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        m['namaLengkap']?.toString() ?? 'Anggota',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: const Color(0xFF1E293B),
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (isMe) ...[
                                      const SizedBox(width: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF0F172A),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'ANDA',
                                          style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.white),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'No. ${m['nomorAnggota']?.toString() ?? '-'}',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                                ),
                                if (m['desa'] != null) ...[
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 10, color: Colors.grey),
                                      const SizedBox(width: 2),
                                      Flexible(
                                        child: Text(
                                          '${m['desa']}, ${m['kecamatan'] ?? ''}',
                                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'A';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }
}
