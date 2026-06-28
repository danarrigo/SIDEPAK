import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/koperasi_provider.dart';

class PrankOverlay extends StatefulWidget {
  const PrankOverlay({super.key});

  @override
  State<PrankOverlay> createState() => _PrankOverlayState();
}

class _PrankOverlayState extends State<PrankOverlay> {
  bool _visible = false;
  String? _lastShown;
  Timer? _pollTimer;
  Timer? _hideTimer;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _pollForEffect();
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _hideTimer?.cancel();
    super.dispose();
  }

  Future<void> _pollForEffect() async {
    if (!mounted) return;
    final provider = context.read<KoperasiProvider>();
    final effect = await provider.checkActiveEffect();
    if (effect != null && effect != _lastShown) {
      _show(effect);
    }
  }

  void _show(String effect) {
    if (!mounted) return;
    setState(() {
      _visible = true;
      _lastShown = effect;
    });
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 4), () async {
      if (!mounted) return;
      setState(() {
        _visible = false;
      });
      // After animation, refresh to clear effect
      await context.read<KoperasiProvider>().fetchData();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Also listen for direct changes
    final provider = context.watch<KoperasiProvider>();
    final effect = provider.activeEffect;
    if (effect != null && effect != _lastShown && !_visible) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _show(effect);
      });
    }

    if (!_visible) return const SizedBox.shrink();

    return Positioned.fill(
      child: IgnorePointer(
        child: Container(
          color: const Color(0xFFEF4444).withOpacity(0.35),
          alignment: Alignment.center,
          child: _ShakeWidget(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFEF4444), width: 4),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withOpacity(0.4),
                    blurRadius: 30,
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    '💥 KENA PRANK! 💥',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFDC2626),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Seseorang baru saja mengirimkan efek "$_lastShown" ke kamu!',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF1E293B),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ShakeWidget extends StatefulWidget {
  final Widget child;
  const _ShakeWidget({required this.child});

  @override
  State<_ShakeWidget> createState() => _ShakeWidgetState();
}

class _ShakeWidgetState extends State<_ShakeWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..repeat(reverse: false);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        // Generate shake offset
        final dx = (t == 0) ? 0.0 : (t < 0.1
            ? -5
            : t < 0.2
                ? 5
                : t < 0.3
                    ? -10
                    : t < 0.4
                        ? 10
                        : t < 0.5
                            ? -5
                            : t < 0.6
                                ? 5
                                : t < 0.7
                                    ? -2
                                    : 0);
        return Transform.translate(
          offset: Offset(dx.toDouble(), 0),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
