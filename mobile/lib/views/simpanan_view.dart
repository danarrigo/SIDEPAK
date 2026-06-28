import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class SimpananView extends StatefulWidget {
  const SimpananView({super.key});

  @override
  State<SimpananView> createState() => _SimpananViewState();
}

class _SimpananViewState extends State<SimpananView> {
  final TextEditingController _amountController = TextEditingController();
  bool _isLoading = false;

  String fmtMoney(int v) =>
      'Rp ${v.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}';

  void _showSnackBar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _payDues(KoperasiProvider provider, String type) async {
    setState(() {
      _isLoading = true;
    });
    final res = await provider.payDuesFromWallet(type);
    setState(() {
      _isLoading = false;
    });

    if (res == 'success') {
      _showSnackBar('Pembayaran Berhasil!');
    } else {
      _showSnackBar(res, isError: true);
    }
  }

  Future<void> _depositSavings(KoperasiProvider provider) async {
    final amt = int.tryParse(_amountController.text) ?? 0;
    if (amt <= 0) {
      _showSnackBar('Masukkan jumlah simpanan yang valid.', isError: true);
      return;
    }

    if (provider.walletBalance < amt) {
      _showSnackBar('Saldo dompet digital tidak mencukupi.', isError: true);
      return;
    }

    Navigator.pop(context); // Close dialog
    setState(() {
      _isLoading = true;
    });
    final res = await provider.depositSavingsFromWallet(amt, 'Simpanan Sukarela Mandiri');
    setState(() {
      _isLoading = false;
    });

    if (res == 'success') {
      _amountController.clear();
      _showSnackBar('Simpanan Sukarela Berhasil Ditambahkan!');
    } else {
      _showSnackBar(res, isError: true);
    }
  }

  void _showDepositDialog(KoperasiProvider provider) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Simpanan Sukarela', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Saldo Dompet: ${fmtMoney(provider.walletBalance)}',
                style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Jumlah Simpanan (Rp)',
                  labelStyle: const TextStyle(fontSize: 13),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixText: 'Rp ',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () => _depositSavings(provider),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Simpan', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final int totalSimpanan = provider.simpananPokok + provider.simpananWajib + provider.simpananSukarela;

    // Combine history for a single mutations ledger list
    final List<dynamic> combinedTxs = [];
    for (var s in provider.listSavings) {
      combinedTxs.add({
        'type': 'savings',
        'label': s['description'] ?? 'Simpanan Sukarela',
        'amount': (s['amount'] as num?)?.toInt() ?? 0,
        'isPositive': s['type'] == 'deposit',
        'date': s['transactionDate'] ?? s['createdAt'] ?? '',
        'rawDate': DateTime.tryParse(s['transactionDate'] ?? s['createdAt'] ?? '') ?? DateTime.now(),
      });
    }
    for (var d in provider.listDues) {
      if (d['status'] == 'paid') {
        combinedTxs.add({
          'type': 'dues',
          'label': d['type'] == 'initial' ? 'Simpanan Pokok' : 'Simpanan Wajib',
          'amount': (d['amount'] as num?)?.toInt() ?? 0,
          'isPositive': true,
          'date': d['paymentDate'] ?? d['createdAt'] ?? '',
          'rawDate': DateTime.tryParse(d['paymentDate'] ?? d['createdAt'] ?? '') ?? DateTime.now(),
        });
      }
    }
    combinedTxs.sort((a, b) => b['rawDate'].compareTo(a['rawDate']));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Simpanan & Mutasi', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top wallet bar
                Container(
                  color: const Color(0xFF0F172A),
                  padding: const EdgeInsets.only(left: 20, right: 20, bottom: 24, top: 4),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.account_balance_wallet, color: Colors.blueAccent, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Saldo Dompet Digital:',
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                        Text(
                          fmtMoney(provider.walletBalance),
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Total simpanan card
                      Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('TOTAL SIMPANAN ANDA', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                              const SizedBox(height: 6),
                              Text(
                                fmtMoney(totalSimpanan),
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Grid of 3 savings types
                      const Text('Rincian Simpanan Koperasi', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                      const SizedBox(height: 8),

                      // Card Pokok
                      _buildSavingsCard(
                        title: 'Simpanan Pokok (Initial)',
                        requiredAmt: 100000,
                        balance: provider.simpananPokok,
                        isPaid: provider.isPokokPaid,
                        onPay: () => _payDues(provider, 'initial'),
                        badgeColor: provider.isPokokPaid ? Colors.green : Colors.red,
                        badgeText: provider.isPokokPaid ? 'LUNAS' : 'WAJIB BAYAR',
                      ),

                      // Card Wajib
                      _buildSavingsCard(
                        title: 'Simpanan Wajib (Bulanan)',
                        requiredAmt: 50000,
                        balance: provider.simpananWajib,
                        isPaid: provider.isWajibPaidThisMonth,
                        onPay: () => _payDues(provider, 'monthly'),
                        badgeColor: provider.isWajibPaidThisMonth ? Colors.green : Colors.red,
                        badgeText: provider.isWajibPaidThisMonth ? 'LUNAS BULAN INI' : 'TUNGGAKAN BULAN INI',
                      ),

                      // Card Sukarela
                      Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Simpanan Sukarela', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                    const SizedBox(height: 4),
                                    const Text('Bebas menabung kapan saja.', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                    const SizedBox(height: 8),
                                    Text(fmtMoney(provider.simpananSukarela), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () => _showDepositDialog(provider),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF3B82F6),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                ),
                                child: const Text('Menabung', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Mutation Log section
                      const Text('Mutasi Transaksi & Riwayat', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                      const SizedBox(height: 8),

                      Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: combinedTxs.isEmpty
                              ? const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 24),
                                  child: Center(child: Text('Belum ada riwayat transaksi.', style: TextStyle(color: Colors.grey, fontSize: 12))),
                                )
                              : ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: combinedTxs.length,
                                  separatorBuilder: (_, __) => const Divider(color: Color(0xFFF1F5F9), height: 12),
                                  itemBuilder: (context, i) {
                                    final tx = combinedTxs[i];
                                    final int amt = tx['amount'];
                                    final bool isPositive = tx['isPositive'];
                                    final String date = tx['date'] != null ? tx['date'].toString().split('T')[0] : '';
                                    return Row(
                                      children: [
                                        Container(
                                          width: 32,
                                          height: 32,
                                          decoration: BoxDecoration(
                                            color: isPositive ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(
                                            isPositive ? Icons.add_circle_outline : Icons.remove_circle_outline,
                                            color: isPositive ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
                                            size: 16,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(tx['label'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                              Text('$date • ${tx['type'] == 'dues' ? 'Iuran' : 'Simpanan'}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                            ],
                                          ),
                                        ),
                                        Text(
                                          '${isPositive ? '+' : '-'} ${fmtMoney(amt)}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: isPositive ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSavingsCard({
    required String title,
    required int requiredAmt,
    required int balance,
    required bool isPaid,
    required VoidCallback onPay,
    required Color badgeColor,
    required String badgeText,
  }) {
    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                Container(
                  decoration: BoxDecoration(color: badgeColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  child: Text(badgeText, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: badgeColor)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Terbayar', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    const SizedBox(height: 2),
                    Text(fmtMoney(balance), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  ],
                ),
                if (!isPaid)
                  ElevatedButton(
                    onPressed: onPay,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    child: Text('Bayar ${fmtMoney(requiredAmt)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
