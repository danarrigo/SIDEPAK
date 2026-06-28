import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';

class MarketplaceListForm extends StatefulWidget {
  const MarketplaceListForm({super.key});

  @override
  State<MarketplaceListForm> createState() => _MarketplaceListFormState();
}

class _MarketplaceListFormState extends State<MarketplaceListForm> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController(text: '1');
  final _imageUrlCtrl = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    _imageUrlCtrl.dispose();
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

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty) {
      _showSnack('Nama barang wajib diisi.', isError: true);
      return;
    }
    final price = int.tryParse(_priceCtrl.text);
    if (price == null || price < 1) {
      _showSnack('Harga harus angka minimal 1 poin.', isError: true);
      return;
    }
    final stock = int.tryParse(_stockCtrl.text);
    if (stock == null || stock < 1) {
      _showSnack('Stok harus angka minimal 1.', isError: true);
      return;
    }

    setState(() => _busy = true);
    final provider = context.read<KoperasiProvider>();
    final msg = await provider.listMarketplaceItem(
      name: _nameCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      priceInPoints: price,
      stock: stock,
      imageUrl: _imageUrlCtrl.text.trim().isEmpty ? null : _imageUrlCtrl.text.trim(),
    );
    setState(() => _busy = false);
    if (msg.contains('berhasil')) {
      _showSnack(msg);
      if (mounted) Navigator.pop(context);
    } else {
      _showSnack(msg, isError: true);
    }
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
                  Icon(Icons.storefront, color: Color(0xFF0F172A)),
                  SizedBox(width: 8),
                  Text(
                    'Daftarkan Barang',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Barang Anda akan ditampilkan di Pasar Anggota.',
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              _buildField(_nameCtrl, 'Nama Barang *', Icons.shopping_bag),
              const SizedBox(height: 12),
              _buildField(_priceCtrl, 'Harga (Poin) *', Icons.stars, isNumber: true),
              const SizedBox(height: 12),
              _buildField(_stockCtrl, 'Stok *', Icons.inventory, isNumber: true),
              const SizedBox(height: 12),
              _buildField(_imageUrlCtrl, 'URL Gambar (Opsional)', Icons.image),
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
                        'Posting Barang',
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

  Widget _buildField(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    bool isNumber = false,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 12),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        prefixIcon: Icon(icon, size: 18),
      ),
      style: const TextStyle(fontSize: 12),
    );
  }
}
