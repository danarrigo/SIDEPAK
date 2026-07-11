import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';

class AdminGovernanceView extends StatefulWidget {
  const AdminGovernanceView({super.key});

  @override
  State<AdminGovernanceView> createState() => _AdminGovernanceViewState();
}

class _AdminGovernanceViewState extends State<AdminGovernanceView>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showForm({Map<String, dynamic>? item}) {
    final bool isEvent = _tabController.index == 0;

    final TextEditingController titleController = TextEditingController(
        text: item == null
            ? null
            : (isEvent ? item['name']?.toString() : item['title']?.toString()));
    final TextEditingController descController = TextEditingController(
        text: item == null ? null : item['description']?.toString());

    DateTime? startDate;
    DateTime? endDate;

    if (item != null) {
      if (item['startDate'] != null)
        startDate = DateTime.tryParse(item['startDate']);
      if (item['endDate'] != null) endDate = DateTime.tryParse(item['endDate']);
      if (!isEvent && item['createdAt'] != null && endDate == null) {
        endDate = DateTime.tryParse(item['createdAt']);
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 24,
                right: 24,
                top: 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    '${item == null ? 'Buat' : 'Edit'} ${isEvent ? 'Event' : 'Proposal'}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: titleController,
                    decoration: InputDecoration(
                      labelText: 'Judul / Nama',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: descController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText: 'Deskripsi',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (isEvent) ...[
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Tanggal Mulai',
                          style: TextStyle(fontSize: 14)),
                      subtitle: Text(startDate != null
                          ? startDate.toString().substring(0, 16)
                          : 'Pilih Tanggal & Waktu'),
                      trailing: const Icon(Icons.calendar_today_rounded),
                      onTap: () async {
                        final date = await showDatePicker(
                            context: context,
                            initialDate: startDate ?? DateTime.now(),
                            firstDate: DateTime(2000),
                            lastDate: DateTime(2100));
                        if (date != null) {
                          final time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay.fromDateTime(
                                  startDate ?? DateTime.now()));
                          if (time != null) {
                            setModalState(() {
                              startDate = DateTime(date.year, date.month,
                                  date.day, time.hour, time.minute);
                            });
                          }
                        }
                      },
                    ),
                  ],
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Batas Akhir (Tenggat Waktu)',
                        style: TextStyle(fontSize: 14)),
                    subtitle: Text(endDate != null
                        ? endDate.toString().substring(0, 16)
                        : 'Pilih Tanggal & Waktu'),
                    trailing: const Icon(Icons.calendar_today_rounded),
                    onTap: () async {
                      final date = await showDatePicker(
                          context: context,
                          initialDate: endDate ?? DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100));
                      if (date != null) {
                        final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.fromDateTime(
                                endDate ?? DateTime.now()));
                        if (time != null) {
                          setModalState(() {
                            endDate = DateTime(date.year, date.month, date.day,
                                time.hour, time.minute);
                          });
                        }
                      }
                    },
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      if (titleController.text.isEmpty ||
                          descController.text.isEmpty ||
                          endDate == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content:
                                    Text('Harap lengkapi semua data wajib.')));
                        return;
                      }
                      if (isEvent && startDate == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'Harap lengkapi tanggal mulai event.')));
                        return;
                      }

                      Navigator.pop(context);
                      final provider =
                          Provider.of<KoperasiProvider>(context, listen: false);

                      String msg = '';
                      if (isEvent) {
                        if (item == null) {
                          msg = await provider.adminCreateEvent(
                              titleController.text,
                              descController.text,
                              startDate!,
                              endDate!);
                        } else {
                          msg = await provider.adminEditEvent(
                              item['id'],
                              titleController.text,
                              descController.text,
                              startDate!,
                              endDate!);
                        }
                      } else {
                        if (item == null) {
                          msg = await provider.adminCreateProposal(
                              titleController.text,
                              descController.text,
                              endDate!);
                        } else {
                          msg = await provider.adminEditProposal(
                              item['id'],
                              titleController.text,
                              descController.text,
                              endDate!);
                        }
                      }

                      if (context.mounted) {
                        ScaffoldMessenger.of(context)
                            .showSnackBar(SnackBar(content: Text(msg)));
                      }
                    },
                    child: const Text('Simpan',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16)),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final stats = provider.adminStats ?? {};
    final events = (stats['allEvents'] as List?) ?? [];
    final proposals = (stats['allProposals'] as List?) ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF1F5F9),
        elevation: 0,
        title: const Text(
          'Tata Kelola & Event',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w900,
            fontSize: 20,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF0F172A),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFFFACC15),
          indicatorWeight: 4,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'Event'),
            Tab(text: 'Proposal'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildList(events, true),
          _buildList(proposals, false),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF0F172A),
        onPressed: () => _showForm(),
        child: const Icon(Icons.add_rounded, color: Colors.white),
      ),
    );
  }

  Widget _buildList(List items, bool isEvent) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.folder_open_rounded,
                size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            const Text(
              'Belum ada data',
              style: TextStyle(
                  color: Colors.grey,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final String title =
            isEvent ? (item['name'] ?? 'Event') : (item['title'] ?? 'Proposal');
        final String desc = item['description'] ?? '';
        final String status = item['status'] ?? '';

        DateTime? date;
        if (isEvent && item['startDate'] != null) {
          date = DateTime.tryParse(item['startDate']);
        } else if (!isEvent && item['createdAt'] != null) {
          date = DateTime.tryParse(item['createdAt']);
        }

        Color statusColor = Colors.grey;
        if (status == 'active') statusColor = Colors.teal;
        if (status == 'pending_approval') statusColor = Colors.amber;
        if (status == 'completed') statusColor = Colors.blue;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Color(0xFF0F172A)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: const Icon(Icons.edit_rounded,
                        color: Colors.grey, size: 20),
                    onPressed: () => _showForm(item: item),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                desc,
                style: const TextStyle(color: Colors.grey, fontSize: 12),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      status.toUpperCase().replaceAll('_', ' '),
                      style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  if (date != null)
                    Text(
                      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}',
                      style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 10,
                          fontWeight: FontWeight.bold),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
