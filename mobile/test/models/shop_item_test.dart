import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/shop_item.dart';

void main() {
  group('ShopItem.fromJson', () {
    test('parses all fields', () {
      final s = ShopItem.fromJson({
        'id': 1,
        'name': 'Freeze Streak',
        'description': 'Lindungi streak kamu',
        'priceInPoints': 200,
        'effectType': 'freeze_streak',
        'effectValue': '24h',
      });
      expect(s.id, 1);
      expect(s.title, 'Freeze Streak');
      expect(s.description, 'Lindungi streak kamu');
      expect(s.cost, 200);
      expect(s.effectType, 'freeze_streak');
      expect(s.effectValue, '24h');
    });

    test('effectType is required field with default empty', () {
      final s = ShopItem.fromJson({
        'id': 1,
        'name': 'X',
        'priceInPoints': 10,
      });
      expect(s.effectType, '');
    });
  });

  group('ShopItem effectType icon mapping', () {
    test('freeze_streak returns ac_unit icon', () {
      final s = ShopItem(id: 1, title: 'X', cost: 1, effectType: 'freeze_streak');
      expect(s.icon, Icons.ac_unit);
    });

    test('point_bomb returns dangerous icon', () {
      final s = ShopItem(id: 1, title: 'X', cost: 1, effectType: 'point_bomb');
      expect(s.icon, Icons.dangerous);
    });

    test('prank returns sentiment_very_satisfied icon', () {
      final s = ShopItem(id: 1, title: 'X', cost: 1, effectType: 'prank');
      expect(s.icon, Icons.sentiment_very_satisfied);
    });

    test('unknown effectType falls back to rocket_launch', () {
      final s = ShopItem(id: 1, title: 'X', cost: 1, effectType: 'mystery');
      expect(s.icon, Icons.rocket_launch);
    });
  });

  group('InventoryItem.fromJson', () {
    test('parses with nested item object', () {
      final inv = InventoryItem.fromJson({
        'id': 1,
        'quantity': 5,
        'item': {
          'id': 7,
          'name': 'Power Up',
          'priceInPoints': 100,
          'effectType': 'prank',
        },
      });
      expect(inv.id, 1);
      expect(inv.quantity, 5);
      expect(inv.item.title, 'Power Up');
      expect(inv.item.effectType, 'prank');
    });

    test('falls back to empty item when item field is missing', () {
      final inv = InventoryItem.fromJson({'id': 2, 'quantity': 0});
      expect(inv.id, 2);
      expect(inv.quantity, 0);
      expect(inv.item.id, 0);
      expect(inv.item.title, '');
    });
  });
}
