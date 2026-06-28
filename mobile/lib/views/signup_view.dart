import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

class SignupView extends StatefulWidget {
  const SignupView({super.key});

  @override
  State<SignupView> createState() => _SignupViewState();
}

class _SignupViewState extends State<SignupView> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nikController = TextEditingController();
  final _namaController = TextEditingController();
  final _provinsiController = TextEditingController();
  final _kabupatenController = TextEditingController();
  final _kecamatanController = TextEditingController();
  final _desaController = TextEditingController();
  final _koperasiController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nikController.dispose();
    _namaController.dispose();
    _provinsiController.dispose();
    _kabupatenController.dispose();
    _kecamatanController.dispose();
    _desaController.dispose();
    _koperasiController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final nik = _nikController.text.trim();
    final name = _namaController.text.trim();
    final provinsi = _provinsiController.text.trim();
    final kabupaten = _kabupatenController.text.trim();
    final kecamatan = _kecamatanController.text.trim();
    final desa = _desaController.text.trim();
    final koperasi = _koperasiController.text.trim();

    if (email.isEmpty || password.isEmpty || nik.isEmpty || name.isEmpty || koperasi.isEmpty) {
      setState(() {
        _errorMessage = 'Field bertanda (*) wajib diisi.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final provider = context.read<KoperasiProvider>();
    final success = await provider.signup(
      email: email,
      password: password,
      nik: nik,
      fullName: name,
      provinsi: provinsi,
      kabupaten: kabupaten,
      kecamatan: kecamatan,
      desa: desa,
      koperasi: koperasi,
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pendaftaran berhasil! Silakan login.')),
      );
      Navigator.pop(context);
    } else {
      setState(() {
        _errorMessage = 'Pendaftaran gagal. Silakan coba lagi.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Daftar Anggota', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.redAccent.withOpacity(0.3))),
                child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            _buildField(_emailController, 'Email *', Icons.email),
            const SizedBox(height: 12),
            _buildField(_passwordController, 'Password *', Icons.lock, obscureText: true),
            const SizedBox(height: 12),
            _buildField(_nikController, 'NIK *', Icons.badge),
            const SizedBox(height: 12),
            _buildField(_namaController, 'Nama Lengkap *', Icons.person),
            const SizedBox(height: 12),
            _buildField(_provinsiController, 'Provinsi', Icons.map),
            const SizedBox(height: 12),
            _buildField(_kabupatenController, 'Kabupaten', Icons.location_city),
            const SizedBox(height: 12),
            _buildField(_kecamatanController, 'Kecamatan', Icons.explore),
            const SizedBox(height: 12),
            _buildField(_desaController, 'Desa', Icons.home),
            const SizedBox(height: 12),
            _buildField(_koperasiController, 'Koperasi *', Icons.corporate_fare),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleSignup,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFACC15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                  : const Text('Daftar', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController controller, String label, IconData icon, {bool obscureText = false}) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        prefixIcon: Icon(icon, color: Colors.white70),
      ),
    );
  }
}
