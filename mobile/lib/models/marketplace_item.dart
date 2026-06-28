class MarketplaceItem {
  final int id;
  final String name;
  final String description;
  final int priceInPoints;
  final int stock;
  final String? imageUrl;
  final int sellerId;
  final String? sellerName;

  MarketplaceItem({
    required this.id,
    required this.name,
    this.description = '',
    required this.priceInPoints,
    required this.stock,
    this.imageUrl,
    required this.sellerId,
    this.sellerName,
  });

  factory MarketplaceItem.fromJson(Map<String, dynamic> json) {
    final seller = json['seller'] as Map<String, dynamic>?;
    return MarketplaceItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      priceInPoints: (json['priceInPoints'] as num?)?.toInt() ?? 0,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl'] as String?,
      sellerId: (json['sellerId'] as num?)?.toInt() ?? 0,
      sellerName: seller?['namaLengkap'] as String?,
    );
  }
}
