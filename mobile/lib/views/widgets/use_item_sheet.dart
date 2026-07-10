import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/shop_item.dart';
import '../../providers/koperasi_provider.dart';

/// Bottom sheet that lists a member's inventory items and lets them
/// activate (use) one against an optional battle opponent.
///
/// Mirrors the desktop's `UseItemClient` modal.
class UseItemSheet extends StatefulWidget {
  final int? targetMemberId;
  const UseItemSheet({super.key, this.targetMemberId});

  @override
  State<UseItemSheet> createState() => _UseItemSheetState();
}

class _UseItemSheetState extends State<UseItemSheet> {
  bool _busy = false;

  void _showSnackVia(ScaffoldMessengerState messenger, String message,
      {bool isError = false}) {
    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        content:
            Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _use(BuildContext ctx, int itemId) async {
    setState(() => _busy = true);
    final provider = ctx.read<KoperasiProvider>();
    final messenger = ScaffoldMessenger.of(ctx);
    final navigator = Navigator.of(ctx);
    final msg = await provider.useInventoryItem(
      itemId,
      targetMemberId: widget.targetMemberId,
    );
    if (!mounted) return;
    setState(() => _busy = false);
    final isErr = !msg.toLowerCase().contains('berhasil');
    _showSnackVia(messenger, msg, isError: isErr);
    if (!isErr) {
      // Close sheet on success after a short delay
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) navigator.pop();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KoperasiProvider>();
    final inventory = provider.inventory;

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
            20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_fix_high,
                        color: Color(0xFFFACC15), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Gunakan Item',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: _busy ? null : () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Pilih item dari inventory Anda',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            if (inventory.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Column(
                  children: [
                    Icon(Icons.inventory_2_outlined,
                        size: 48, color: Color(0xFFCBD5E1)),
                    SizedBox(height: 8),
                    Text(
                      'Inventory kosong.',
                      style: TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                          fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Beli item di tab Pasar Poin.',
                      style: TextStyle(color: Colors.grey, fontSize: 10),
                    ),
                  ],
                ),
              )
            else
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 380),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: inventory.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, idx) {
                    final inv = inventory[idx];
                    return _InventoryRow(
                      inv: inv,
                      busy: _busy,
                      onUse: () => _use(context, inv.item.id),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _InventoryRow extends StatelessWidget {
  final InventoryItem inv;
  final bool busy;
  final VoidCallback onUse;
  const _InventoryRow(
      {required this.inv, required this.busy, required this.onUse});

  @override
  Widget build(BuildContext context) {
    final ShopItem s = inv.item;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: s.iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(s.icon, color: s.iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(s.title,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A))),
                if (s.description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(s.description,
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                ],
                const SizedBox(height: 2),
                Text('Jumlah: ${inv.quantity}',
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFFACC15))),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: busy ? null : onUse,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: busy ? Colors.grey.shade300 : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: busy
                    ? const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        'Pakai',
                        style: TextStyle(
                            color: Color(0xFFFACC15),
                            fontSize: 11,
                            fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
