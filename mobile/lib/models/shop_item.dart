import 'package:flutter/material.dart';

class ShopItem {
  final int id;
  final String title;
  final String description;
  final int cost;
  final String effectType;
  final String? effectValue;

  ShopItem({
    required this.id,
    required this.title,
    this.description = '',
    required this.cost,
    required this.effectType,
    this.effectValue,
  });

  IconData get icon {
    switch (effectType) {
      case 'freeze_streak':
        return Icons.ac_unit;
      case 'point_bomb':
        return Icons.dangerous;
      case 'prank':
        return Icons.sentiment_very_satisfied;
      default:
        return Icons.rocket_launch;
    }
  }

  Color get iconColor {
    switch (effectType) {
      case 'freeze_streak':
        return Colors.teal;
      case 'point_bomb':
        return Colors.pink;
      case 'prank':
        return Colors.deepOrange;
      default:
        return Colors.purple;
    }
  }

  Color get bgGlow {
    return iconColor.withOpacity(0.1);
  }

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] as int,
      title: (json['name'] as String?) ?? '',
      description: (json['description'] as String?) ?? '',
      cost: (json['priceInPoints'] as num?)?.toInt() ?? 0,
      effectType: (json['effectType'] as String?) ?? '',
      effectValue: json['effectValue'] as String?,
    );
  }
}

class InventoryItem {
  final int id;
  final int quantity;
  final ShopItem item;

  InventoryItem({
    required this.id,
    required this.quantity,
    required this.item,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    final raw = json['item'] as Map<String, dynamic>?;
    final shop = raw == null
        ? ShopItem(id: 0, title: '', cost: 0, effectType: '')
        : ShopItem.fromJson(raw);
    return InventoryItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      item: shop,
    );
  }
}