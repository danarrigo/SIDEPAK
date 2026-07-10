export function calculateMembershipScore(level: number, walletBalance: number, creditScore: number): number {
  const levelScore = level * 50;
  const balanceScore = Math.floor(walletBalance / 10000);
  const creditScorePoints = creditScore * 5;
  return levelScore + balanceScore + creditScorePoints;
}

export function getRankFromScore(score: number): string {
  if (score < 2500) return "Perunggu";
  if (score < 5000) return "Perak";
  if (score < 10000) return "Emas";
  if (score < 25000) return "Platinum";
  return "Legenda";
}

export function getNextRankRequirement(score: number): { nextRankName: string, pointsNeeded: number } {
  if (score < 2500) return { nextRankName: "Perak", pointsNeeded: 2500 - score };
  if (score < 5000) return { nextRankName: "Emas", pointsNeeded: 5000 - score };
  if (score < 10000) return { nextRankName: "Platinum", pointsNeeded: 10000 - score };
  if (score < 25000) return { nextRankName: "Legenda", pointsNeeded: 25000 - score };
  return { nextRankName: "Legenda", pointsNeeded: 0 };
}

export function getRankBenefits(rank: string): { shuMultiplier: number, serviceFee: number } {
  switch (rank) {
    case "Legenda": return { shuMultiplier: 2.0, serviceFee: 0 };
    case "Platinum": return { shuMultiplier: 1.8, serviceFee: 1.0 };
    case "Emas": return { shuMultiplier: 1.5, serviceFee: 1.5 };
    case "Perak": return { shuMultiplier: 1.2, serviceFee: 2.0 };
    case "Perunggu":
    default:
      return { shuMultiplier: 1.0, serviceFee: 2.5 };
  }
}

export function getRankLoanLimits(rank: string): { maxPercent: number, maxAmount: number } {
  switch (rank) {
    case "Legenda": return { maxPercent: 50, maxAmount: 100000000 };
    case "Platinum": return { maxPercent: 40, maxAmount: 50000000 };
    case "Emas": return { maxPercent: 30, maxAmount: 25000000 };
    case "Perak": return { maxPercent: 20, maxAmount: 10000000 };
    case "Perunggu":
    default:
      return { maxPercent: 10, maxAmount: 5000000 };
  }
}
