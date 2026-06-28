import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/koperasi_provider.dart';

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

class SignupView extends StatefulWidget {
  const SignupView({super.key});

  @override
  State<SignupView> createState() => _SignupViewState();
}

class _SignupViewState extends State<SignupView> {
  // Text controllers
  final _namaCtrl = TextEditingController();
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
          _provinces = data.map<_LocationItem>((j) => _LocationItem.fromJson(j)).toList();
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
        Uri.parse('https://ibnux.github.io/data-indonesia/kabupaten/$provId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _regencies = data.map<_LocationItem>((j) => _LocationItem.fromJson(j)).toList();
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
        Uri.parse('https://ibnux.github.io/data-indonesia/kecamatan/$regId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _districts = data.map<_LocationItem>((j) => _LocationItem.fromJson(j)).toList();
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
        Uri.parse('https://ibnux.github.io/data-indonesia/kelurahan/$distId.json'),
      );
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        setState(() {
          _villages = data.map<_LocationItem>((j) => _LocationItem.fromJson(j)).toList();
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
    final koperasiName = _selectedDesaName.isNotEmpty ? 'Koperasi $_selectedDesaName' : '';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Daftar Akun', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Center(
                child: Padding(
                  padding: EdgeInsets.only(bottom: 16),
                  child: Text(
                    'Bergabung dengan KopDes hari ini',
                    style: TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                ),
              ),
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
                    style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              _buildTextField(_namaCtrl, 'Nama Lengkap', Icons.person, 'John Doe'),
              const SizedBox(height: 12),
              _buildTextField(
                _nikCtrl,
                'NIK',
                Icons.badge,
                '16 Digit NIK',
                validator: (v) {
                  final s = v ?? '';
                  if (s.isEmpty) return 'Bagian ini harus diisi.';
                  if (!RegExp(r'^\d{16}$').hasMatch(s)) return 'NIK harus tepat 16 digit angka.';
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
                  if (!RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$').hasMatch(s)) return 'Email tidak valid.';
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
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              _buildDropdown(
                label: 'Provinsi',
                value: _selectedProvName.isEmpty ? null : _selectedProvName,
                items: _provinces.map((p) => DropdownMenuItem(value: p.nama, child: Text(p.nama))).toList(),
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
                items: _regencies.map((r) => DropdownMenuItem(value: r.nama, child: Text(r.nama))).toList(),
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
                items: _districts.map((d) => DropdownMenuItem(value: d.nama, child: Text(d.nama))).toList(),
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
                items: _villages.map((v) => DropdownMenuItem(value: v.nama, child: Text(v.nama))).toList(),
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
                    : [DropdownMenuItem(value: koperasiName, child: Text(koperasiName))],
                hint: 'Pilih Koperasi yang tersedia di Desa Anda',
                disabled: _selectedDesaName.isEmpty,
                onChanged: null,
              ),
              const SizedBox(height: 4),
              const Padding(
                padding: EdgeInsets.only(left: 4, bottom: 16),
                child: Text(
                  'Koperasi yang dipilih harus berada di desa yang sama dengan domisili Anda.',
                  style: TextStyle(color: Colors.white54, fontSize: 10),
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSignup,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFACC15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                      )
                    : const Text(
                        'Buat Akun',
                        style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
              ),
            ],
          ),
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
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        hintText: placeholder,
        hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        prefixIcon: Icon(icon, color: Colors.white70),
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
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Opacity(
          opacity: disabled ? 0.5 : 1.0,
          child: IgnorePointer(
            ignoring: disabled,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.transparent),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: DropdownButton<String>(
                value: value,
                items: items.isEmpty
                    ? null
                    : [
                        if (value == null)
                          DropdownMenuItem(value: '', enabled: false, child: Text(hint, style: const TextStyle(color: Colors.white38))),
                        ...items,
                      ],
                hint: Text(hint, style: const TextStyle(color: Colors.white38, fontSize: 13)),
                onChanged: onChanged,
                isExpanded: true,
                iconEnabledColor: Colors.white70,
                iconDisabledColor: Colors.white38,
                dropdownColor: const Color(0xFF1E293B),
                underline: const SizedBox.shrink(),
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ),
        ),
      ],
    );
  }
}