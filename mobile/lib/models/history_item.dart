class HistoryItem {
  final String opponent;
  final String result;
  final int points;
  final String? date;

  HistoryItem({
    required this.opponent,
    required this.result,
    required this.points,
    this.date,
  });
}