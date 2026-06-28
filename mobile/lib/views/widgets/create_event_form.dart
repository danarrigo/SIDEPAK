import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';

class CreateEventForm extends StatefulWidget {
  const CreateEventForm({super.key});

  @override
  State<CreateEventForm> createState() => _CreateEventFormState();
}

class _CreateEventFormState extends State<CreateEventForm> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  bool _busy = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final now = DateTime.now();
    final initial = isStart ? (_startDate ?? now) : (_endDate ?? (_startDate ?? now));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: now.subtract(const Duration(days: 1)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked == null) return;
    if (!mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: initial.hour, minute: initial.minute),
    );
    if (time == null) return;
    final result = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
    setState(() {
      if (isStart) {
        _startDate = result;
        if (_endDate != null && _endDate!.isBefore(result)) {
          _endDate = null;
        }
      } else {
        _endDate = result;
      }
    });
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty) {
      _showSnack('Nama event wajib diisi.', isError: true);
      return;
    }
    if (_startDate == null) {
      _showSnack('Pilih tanggal mulai.', isError: true);
      return;
    }
    if (_endDate == null) {
      _showSnack('Pilih tanggal selesai.', isError: true);
      return;
    }
    if (_endDate!.isBefore(_startDate!)) {
      _showSnack('Tanggal selesai harus setelah tanggal mulai.', isError: true);
      return;
    }

    setState(() => _busy = true);
    final provider = context.read<KoperasiProvider>();
    final msg = await provider.createEvent(
      name: _nameCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      startDate: _startDate!,
      endDate: _endDate!,
    );
    setState(() => _busy = false);
    if (msg.toLowerCase().contains('berhasil')) {
      _showSnack(msg);
      if (mounted) Navigator.pop(context);
    } else {
      _showSnack(msg, isError: true);
    }
  }

  String _formatDateTime(DateTime? d) {
    if (d == null) return 'Pilih tanggal & jam';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${d.day} ${months[d.month - 1]} ${d.year} • ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: viewInsets),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const Row(
                children: [
                  Icon(Icons.event, color: Color(0xFF0F172A)),
                  SizedBox(width: 8),
                  Text(
                    'Buat Event Koperasi',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Ajak anggota lain berpartisipasi.',
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _nameCtrl,
                decoration: InputDecoration(
                  labelText: 'Nama Event *',
                  labelStyle: const TextStyle(fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  prefixIcon: const Icon(Icons.celebration, size: 18),
                ),
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Deskripsi',
                  labelStyle: const TextStyle(fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              _DatePickerTile(
                label: 'Mulai *',
                value: _formatDateTime(_startDate),
                icon: Icons.play_circle_outline,
                onTap: () => _pickDate(isStart: true),
              ),
              const SizedBox(height: 10),
              _DatePickerTile(
                label: 'Selesai *',
                value: _formatDateTime(_endDate),
                icon: Icons.stop_circle_outlined,
                onTap: () => _pickDate(isStart: false),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _busy ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFACC15),
                  foregroundColor: const Color(0xFF0F172A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _busy
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(color: Color(0xFF0F172A), strokeWidth: 2),
                      )
                    : const Text(
                        'BUAT EVENT',
                        style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: _busy ? null : () => Navigator.pop(context),
                child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DatePickerTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;

  const _DatePickerTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty = value.startsWith('Pilih');
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isEmpty ? const Color(0xFFFEF2F2) : const Color(0xFFECFDF5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isEmpty ? const Color(0xFFFCA5A5) : const Color(0xFF86EFAC),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isEmpty ? const Color(0xFFDC2626) : const Color(0xFF16A34A), size: 18),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isEmpty ? const Color(0xFFDC2626) : const Color(0xFF166534),
                  ),
                ),
              ],
            ),
            const Spacer(),
            const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
          ],
        ),
      ),
    );
  }
}
