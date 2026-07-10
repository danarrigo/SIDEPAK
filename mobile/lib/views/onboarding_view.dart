import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';
import 'login_view.dart';

class _LocationItem {
  final String id;
  final String nama;
  _LocationItem({required this.id, required this.nama});

  factory _LocationItem.fromJson(Map<String, dynamic> json) {
    return _LocationItem(
      id: json['id']?.toString() ?? '',
      nama: json['nama']?.toString() ?? '',
    );
  }
}

class OnboardingView extends StatefulWidget {
  const OnboardingView({super.key});

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  int _step = 1;
  String? _selectedGoal;
  String? _selectedPekerjaan;

  // Text controllers
  final _namaCtrl = TextEditingController();
  final _nomorHpCtrl = TextEditingController();
  final _nikCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  // Form state
  bool _isLoading = false;
  String? _errorMessage;
  final _formKey = GlobalKey<FormState>();

  // Location data
  List<_LocationItem> _provinces = [];
  List<_LocationItem> _regencies = [];
  List<_LocationItem> _districts = [];
  List<_LocationItem> _villages = [];

  // Selected IDs (used to fetch children)
  String _selectedProvId = '';
  String _selectedRegId = '';
  String _selectedDistId = '';

  // Selected names (sent to backend)
  String _selectedProvName = '';
  String _selectedRegName = '';
  String _selectedDistName = '';
  String _selectedDesaName = '';

  @override
  void initState() {
    super.initState();
    _fetchProvinces();
  }

  @override
  void dispose() {
    _namaCtrl.dispose();
    _nomorHpCtrl.dispose();
    _nikCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchProvinces() async {
    try {
      final res = await http.get(
        Uri.parse('https://ibnux.github.io/data-indonesia/provinsi.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _provinces = data
              .map<_LocationItem>((j) => _LocationItem.fromJson(j))
              .toList();
        });
      }
    } catch (e) {
      print('Fetch provinces error: $e');
    }
  }

  Future<void> _fetchRegencies(String provId) async {
    setState(() {
      _regencies = [];
      _districts = [];
      _villages = [];
      _selectedRegId = '';
      _selectedRegName = '';
      _selectedDistId = '';
      _selectedDistName = '';
      _selectedDesaName = '';
    });
    if (provId.isEmpty) return;
    try {
      final res = await http.get(
        Uri.parse(
            'https://ibnux.github.io/data-indonesia/kabupaten/$provId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _regencies = data
              .map<_LocationItem>((j) => _LocationItem.fromJson(j))
              .toList();
        });
      }
    } catch (e) {
      print('Fetch regencies error: $e');
    }
  }

  Future<void> _fetchDistricts(String regId) async {
    setState(() {
      _districts = [];
      _villages = [];
      _selectedDistId = '';
      _selectedDistName = '';
      _selectedDesaName = '';
    });
    if (regId.isEmpty) return;
    try {
      final res = await http.get(
        Uri.parse(
            'https://ibnux.github.io/data-indonesia/kecamatan/$regId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _districts = data
              .map<_LocationItem>((j) => _LocationItem.fromJson(j))
              .toList();
        });
      }
    } catch (e) {
      print('Fetch districts error: $e');
    }
  }

  Future<void> _fetchVillages(String distId) async {
    setState(() {
      _villages = [];
      _selectedDesaName = '';
    });
    if (distId.isEmpty) return;
    try {
      final res = await http.get(
        Uri.parse(
            'https://ibnux.github.io/data-indonesia/kelurahan/$distId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _villages = data
              .map<_LocationItem>((j) => _LocationItem.fromJson(j))
              .toList();
        });
      }
    } catch (e) {
      print('Fetch villages error: $e');
    }
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedProvName.isEmpty ||
        _selectedRegName.isEmpty ||
        _selectedDistName.isEmpty ||
        _selectedDesaName.isEmpty) {
      setState(() {
        _errorMessage = 'Semua field domisili wajib dipilih.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final provider = context.read<KoperasiProvider>();
    final success = await provider.signup(
      email: _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
      nik: _nikCtrl.text.trim(),
      fullName: _namaCtrl.text.trim(),
      provinsi: _selectedProvName,
      kabupaten: _selectedRegName,
      kecamatan: _selectedDistName,
      desa: _selectedDesaName,
      koperasi: 'Koperasi $_selectedDesaName',
      pekerjaan: _selectedPekerjaan ?? 'Lainnya',
      nomorHp: _nomorHpCtrl.text.trim(),
    );

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pendaftaran berhasil! Silakan login.')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginView()),
      );
    } else {
      setState(() {
        _errorMessage = 'Pendaftaran gagal. Silakan coba lagi.';
      });
    }
  }

  void _nextStep() {
    if (_step == 1 && _selectedGoal == null) return;
    if (_step == 2 && _selectedPekerjaan == null) return;

    if (_step < 3) {
      setState(() {
        _step++;
      });
    }
  }

  void _prevStep() {
    if (_step > 1) {
      setState(() {
        _step--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Personalisasi Akun',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Mari sesuaikan pengalaman Koperasi Anda dan mendaftar',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 32),

              // Progress bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Tujuan',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _step >= 1
                          ? const Color(0xFF0F172A)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                  Text(
                    'Aktivitas',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _step >= 2
                          ? const Color(0xFF0F172A)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                  Text(
                    'Akun',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _step >= 3
                          ? const Color(0xFF0F172A)
                          : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: _step,
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 3 - _step,
                      child: const SizedBox(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Steps Content
              Expanded(
                child: _step == 1
                    ? _buildStep1()
                    : _step == 2
                        ? _buildStep2()
                        : _buildStep3(),
              ),

              // Bottom Navigation Buttons
              if (_step < 3)
                Row(
                  children: [
                    if (_step > 1) ...[
                      Expanded(
                        flex: 1,
                        child: OutlinedButton(
                          onPressed: _prevStep,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Kembali',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                    ],
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: (_step == 1 && _selectedGoal == null) ||
                                (_step == 2 && _selectedPekerjaan == null)
                            ? null
                            : _nextStep,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                          disabledBackgroundColor: const Color(0xFFCBD5E1),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              'Selanjutnya',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward, size: 20),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Apa tujuan utama Anda bergabung?',
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 16),
        _buildOption(
          id: 'pinjaman',
          title: 'Pinjaman Modal Usaha',
          desc: 'Akses pembiayaan dengan bunga ringan',
          icon: Icons.account_balance,
          isSelected: _selectedGoal == 'pinjaman',
          onTap: () => setState(() => _selectedGoal = 'pinjaman'),
        ),
        _buildOption(
          id: 'investasi',
          title: 'Menabung & Investasi',
          desc: 'Kembangkan aset dengan aman',
          icon: Icons.savings,
          isSelected: _selectedGoal == 'investasi',
          onTap: () => setState(() => _selectedGoal = 'investasi'),
        ),
        _buildOption(
          id: 'belanja',
          title: 'Belanja di Marketplace',
          desc: 'Beli dan jual produk sesama anggota',
          icon: Icons.storefront,
          isSelected: _selectedGoal == 'belanja',
          onTap: () => setState(() => _selectedGoal = 'belanja'),
        ),
        _buildOption(
          id: 'jual',
          title: 'Menjual Barang',
          desc: 'Mulai berjualan di marketplace',
          icon: Icons.store,
          isSelected: _selectedGoal == 'jual',
          onTap: () => setState(() => _selectedGoal = 'jual'),
        ),
        _buildOption(
          id: 'jasa',
          title: 'Networking & Menyediakan Jasa',
          desc: 'Tawarkan keahlian ke anggota lain',
          icon: Icons.handshake,
          isSelected: _selectedGoal == 'jasa',
          onTap: () => setState(() => _selectedGoal = 'jasa'),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Apa pekerjaan atau peran utama Anda saat ini?',
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 16),
        _buildOption(
          id: 'petani',
          title: 'Petani / Peternak',
          desc: 'Fokus pada hasil panen dan komoditas',
          icon: Icons.agriculture,
          isSelected: _selectedPekerjaan == 'Petani / Peternak',
          onTap: () => setState(() => _selectedPekerjaan = 'Petani / Peternak'),
        ),
        _buildOption(
          id: 'pedagang',
          title: 'Pedagang / UMKM',
          desc: 'Pemilik warung, toko, atau produksi rumahan',
          icon: Icons.storefront,
          isSelected: _selectedPekerjaan == 'Pedagang / UMKM',
          onTap: () => setState(() => _selectedPekerjaan = 'Pedagang / UMKM'),
        ),
        _buildOption(
          id: 'pegawai',
          title: 'Pegawai / Pekerja Formal',
          desc: 'Memiliki penghasilan atau gaji tetap',
          icon: Icons.work,
          isSelected: _selectedPekerjaan == 'Pegawai / Pekerja Formal',
          onTap: () =>
              setState(() => _selectedPekerjaan = 'Pegawai / Pekerja Formal'),
        ),
        _buildOption(
          id: 'lainnya',
          title: 'Pekerja Lepas / Jasa Lainnya',
          desc: 'Montir, tukang, freelancer, dll',
          icon: Icons.handyman,
          isSelected: _selectedPekerjaan == 'Lainnya',
          onTap: () => setState(() => _selectedPekerjaan = 'Lainnya'),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    final koperasiName =
        _selectedDesaName.isNotEmpty ? 'Koperasi $_selectedDesaName' : '';

    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Lengkapi Profil Anda',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 16),
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(
                      color: Colors.redAccent,
                      fontSize: 11,
                      fontWeight: FontWeight.bold),
                ),
              ),
            _buildTextField(
                _namaCtrl, 'Nama Lengkap', Icons.person, 'John Doe'),
            const SizedBox(height: 12),
            _buildTextField(
              _nomorHpCtrl,
              'Nomor Handphone',
              Icons.phone,
              '081234567890',
              validator: (v) {
                final s = v ?? '';
                if (s.isEmpty) return 'Bagian ini harus diisi.';
                return null;
              },
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _nikCtrl,
              'NIK',
              Icons.badge,
              '16 Digit NIK',
              validator: (v) {
                final s = v ?? '';
                if (s.isEmpty) return 'Bagian ini harus diisi.';
                if (!RegExp(r'^\d{16}$').hasMatch(s))
                  return 'NIK harus tepat 16 digit angka.';
                return null;
              },
              keyboardType: TextInputType.number,
              maxLength: 16,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _emailCtrl,
              'Email',
              Icons.email,
              'nama@email.com',
              validator: (v) {
                final s = v ?? '';
                if (s.isEmpty) return 'Bagian ini harus diisi.';
                if (!RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$').hasMatch(s))
                  return 'Email tidak valid.';
                return null;
              },
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              _passwordCtrl,
              'Kata Sandi',
              Icons.lock,
              'Min. 6 karakter',
              obscureText: true,
              validator: (v) {
                final s = v ?? '';
                if (s.isEmpty) return 'Bagian ini harus diisi.';
                if (s.length < 6) return 'Kata sandi minimal 6 karakter.';
                return null;
              },
            ),
            const SizedBox(height: 24),
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Informasi Domisili & Koperasi',
                  style: TextStyle(
                      color: Color(0xFF0F172A),
                      fontSize: 14,
                      fontWeight: FontWeight.bold),
                ),
              ),
            ),
            _buildDropdown(
              label: 'Provinsi',
              value: _selectedProvName.isEmpty ? null : _selectedProvName,
              items: _provinces
                  .map((p) =>
                      DropdownMenuItem(value: p.nama, child: Text(p.nama)))
                  .toList(),
              hint: 'Pilih Provinsi',
              onChanged: (val) {
                if (val == null) return;
                final item = _provinces.firstWhere((p) => p.nama == val);
                setState(() {
                  _selectedProvId = item.id;
                  _selectedProvName = item.nama;
                });
                _fetchRegencies(item.id);
              },
            ),
            const SizedBox(height: 12),
            _buildDropdown(
              label: 'Kabupaten/Kota',
              value: _selectedRegName.isEmpty ? null : _selectedRegName,
              items: _regencies
                  .map((r) =>
                      DropdownMenuItem(value: r.nama, child: Text(r.nama)))
                  .toList(),
              hint: 'Pilih Kabupaten/Kota',
              disabled: _selectedProvId.isEmpty || _regencies.isEmpty,
              onChanged: (val) {
                if (val == null) return;
                final item = _regencies.firstWhere((r) => r.nama == val);
                setState(() {
                  _selectedRegId = item.id;
                  _selectedRegName = item.nama;
                });
                _fetchDistricts(item.id);
              },
            ),
            const SizedBox(height: 12),
            _buildDropdown(
              label: 'Kecamatan',
              value: _selectedDistName.isEmpty ? null : _selectedDistName,
              items: _districts
                  .map((d) =>
                      DropdownMenuItem(value: d.nama, child: Text(d.nama)))
                  .toList(),
              hint: 'Pilih Kecamatan',
              disabled: _selectedRegId.isEmpty || _districts.isEmpty,
              onChanged: (val) {
                if (val == null) return;
                final item = _districts.firstWhere((d) => d.nama == val);
                setState(() {
                  _selectedDistId = item.id;
                  _selectedDistName = item.nama;
                });
                _fetchVillages(item.id);
              },
            ),
            const SizedBox(height: 12),
            _buildDropdown(
              label: 'Desa/Kelurahan',
              value: _selectedDesaName.isEmpty ? null : _selectedDesaName,
              items: _villages
                  .map((v) =>
                      DropdownMenuItem(value: v.nama, child: Text(v.nama)))
                  .toList(),
              hint: 'Pilih Desa',
              disabled: _selectedDistId.isEmpty || _villages.isEmpty,
              onChanged: (val) {
                if (val == null) return;
                setState(() {
                  _selectedDesaName = val;
                });
              },
            ),
            const SizedBox(height: 12),
            _buildDropdown(
              label: 'Nama Koperasi',
              value: koperasiName.isEmpty ? null : koperasiName,
              items: koperasiName.isEmpty
                  ? []
                  : [
                      DropdownMenuItem(
                          value: koperasiName, child: Text(koperasiName))
                    ],
              hint: 'Pilih Koperasi yang tersedia di Desa Anda',
              disabled: _selectedDesaName.isEmpty,
              onChanged: null,
            ),
            const SizedBox(height: 4),
            const Padding(
              padding: EdgeInsets.only(left: 4, bottom: 16),
              child: Text(
                'Koperasi yang dipilih harus berada di desa yang sama dengan domisili Anda.',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 10),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: OutlinedButton(
                    onPressed: _prevStep,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Kembali',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A)),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSignup,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            'Buat Akun',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildOption({
    required String id,
    required String title,
    required String desc,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF0F172A).withOpacity(0.05)
              : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isSelected ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: isSelected
                    ? const Color(0xFF0F172A)
                    : const Color(0xFF94A3B8),
                size: 28),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? const Color(0xFF0F172A)
                          : const Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    desc,
                    style:
                        const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon,
    String placeholder, {
    bool obscureText = false,
    TextInputType? keyboardType,
    int? maxLength,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      maxLength: maxLength,
      validator: validator,
      style: const TextStyle(color: Color(0xFF0F172A)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF64748B)),
        hintText: placeholder,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF0F172A))),
        prefixIcon: Icon(icon, color: const Color(0xFF64748B)),
        counterText: '',
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<DropdownMenuItem<String>> items,
    required String hint,
    bool disabled = false,
    void Function(String?)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 13,
                fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Opacity(
          opacity: disabled ? 0.5 : 1.0,
          child: IgnorePointer(
            ignoring: disabled,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: DropdownButton<String>(
                value: value,
                items: items.isEmpty
                    ? null
                    : [
                        if (value == null)
                          DropdownMenuItem(
                              value: '',
                              enabled: false,
                              child: Text(hint,
                                  style: const TextStyle(
                                      color: Color(0xFF94A3B8)))),
                        ...items,
                      ],
                hint: Text(hint,
                    style: const TextStyle(
                        color: Color(0xFF94A3B8), fontSize: 13)),
                onChanged: onChanged,
                isExpanded: true,
                iconEnabledColor: const Color(0xFF64748B),
                iconDisabledColor: const Color(0xFFCBD5E1),
                dropdownColor: Colors.white,
                underline: const SizedBox.shrink(),
                style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
