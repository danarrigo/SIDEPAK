import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/marketplace_item.dart';

void main() {
  group('MarketplaceItem.fromJson', () {
    test('parses full payload including seller info', () {
      final json = {
        'id': 7,
        'name': 'Tas Anyaman',
        'description': 'Tas tradisional handmade',
        'priceInPoints': 250,
        'stock': 3,
        'imageUrl': 'https://example.com/tas.jpg',
        'sellerId': 12,
        'seller': {'namaLengkap': 'Siti Aminah'},
      };
      final item = MarketplaceItem.fromJson(json);
      expect(item.id, 7);
      expect(item.name, 'Tas Anyaman');
      expect(item.description, 'Tas tradisional handmade');
      expect(item.priceInPoints, 250);
      expect(item.stock, 3);
      expect(item.imageUrl, 'https://example.com/tas.jpg');
      expect(item.sellerId, 12);
      expect(item.sellerName, 'Siti Aminah');
    });

    test('uses safe defaults for missing optional fields', () {
      final json = {
        'id': 1,
        'name': 'Barang Tanpa Detail',
        'priceInPoints': 10,
        'stock': 1,
        'sellerId': 5,
      };
      final item = MarketplaceItem.fromJson(json);
      expect(item.id, 1);
      expect(item.name, 'Barang Tanpa Detail');
      expect(item.description, '');
      expect(item.imageUrl, isNull);
      expect(item.sellerName, isNull);
      expect(item.priceInPoints, 10);
      expect(item.stock, 1);
    });

    test('coerces numeric fields from int or double', () {
      final item = MarketplaceItem.fromJson({
        'id': 1.0,
        'name': 'X',
        'priceInPoints': 99.9,
        'stock': 5.0,
        'sellerId': 1.0,
      });
      expect(item.id, 1);
      expect(item.priceInPoints, 99);
      expect(item.stock, 5);
      expect(item.sellerId, 1);
    });

    test('falls back to 0 when numeric fields are missing', () {
      final item = MarketplaceItem.fromJson({
        'id': null,
        'name': 'X',
      });
      expect(item.id, 0);
      expect(item.priceInPoints, 0);
      expect(item.stock, 0);
      expect(item.sellerId, 0);
    });
  });
}
