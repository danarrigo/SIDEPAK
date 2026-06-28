class Mission {
  final String id;
  final String title;
  final String description;
  final int points;
  final int targetCount;
  final int progress;
  final bool isCompleted;
  final bool isDaily;

  Mission({
    required this.id,
    required this.title,
    this.description = '',
    required this.points,
    this.targetCount = 1,
    this.progress = 0,
    this.isCompleted = false,
    required this.isDaily,
  });

  bool get isClaimable => progress >= targetCount && !isCompleted;
}