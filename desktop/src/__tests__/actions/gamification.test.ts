import { getWinRate, awardPoints, useItem } from '@/actions/gamification';
import { db } from '@/db';

const mockDb = db as unknown as Record<string, jest.Mock>;

jest.mock('@/db', () => {
  const mDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return { db: mDb };
});

describe('Gamification Actions', () => {
  beforeEach(() => {
    Object.values(db).forEach((mockFn: any) => {
      if (typeof mockFn.mockClear === 'function') {
        mockFn.mockClear();
      }
      if (typeof mockFn.mockReturnThis === 'function') {
        mockFn.mockReturnThis();
      }
    });
    jest.clearAllMocks();
  });

  describe('getWinRate', () => {
    it('returns 0 win rate if no battles exist', async () => {
      mockDb.where.mockResolvedValueOnce([]); // No battles
      
      const result = await getWinRate(1);
      
      expect(result).toEqual({ winRate: 0, totalBattles: 0 });
    });

    it('calculates win rate correctly for mixed results', async () => {
      // 2 wins, 2 losses for memberId = 1
      mockDb.where.mockResolvedValueOnce([
        { id: 1, winnerId: 1, status: 'completed' },
        { id: 2, winnerId: 2, status: 'completed' }, // lost
        { id: 3, winnerId: 1, status: 'completed' },
        { id: 4, winnerId: 3, status: 'completed' }, // lost
      ]);

      const result = await getWinRate(1);
      
      expect(result).toEqual({ winRate: 50, totalBattles: 4 });
    });

    it('calculates 100% win rate correctly', async () => {
      mockDb.where.mockResolvedValueOnce([
        { id: 1, winnerId: 1, status: 'completed' },
      ]);

      const result = await getWinRate(1);
      
      expect(result).toEqual({ winRate: 100, totalBattles: 1 });
    });
  });

  describe('awardPoints', () => {
    it('awards points, levels up correctly, and creates progress if missing', async () => {
      // 1. insert pointTransactions -> handled by mock chain returning
      // 2. select memberProgress -> return empty (not found)
      mockDb.where.mockResolvedValueOnce([]); 
      // 3. insert new memberProgress
      mockDb.returning.mockResolvedValueOnce([{ memberId: 1, xp: 0, pointsBalance: 0, level: 1 }]);
      // 4. update memberProgress -> handled by mock

      const result = await awardPoints(1, 1500, 'Quest');

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(2); // 1500 XP means level 2 (floor(1500/1000) + 1)
      expect(result.levelUp).toBe(true);

      // Verify transactions inserted
      expect(mockDb.insert).toHaveBeenCalledTimes(2); // one for tx, one for progress
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('awards points and updates existing progress without level up', async () => {
      // 1. insert pointTransactions
      // 2. select memberProgress -> return existing
      mockDb.where.mockResolvedValueOnce([{ memberId: 1, xp: 200, pointsBalance: 200, level: 1 }]);
      
      // Awarding 500 points (total 700 XP -> still level 1)
      const result = await awardPoints(1, 500, 'Daily Login');

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(1);
      expect(result.levelUp).toBe(false);
      
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('useItem', () => {
    it('fails if item inventory is 0 or not found', async () => {
      mockDb.where.mockResolvedValueOnce([]); // No inventory found
      
      const result = await useItem(1, 10);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Item tidak ditemukan atau habis.');
    });

    it('deducts inventory and applies prank effect', async () => {
      // 1. Select inventory
      mockDb.where.mockResolvedValueOnce([{ id: 5, memberId: 1, itemId: 10, quantity: 2 }]);
      // 2. Select item details
      mockDb.where.mockResolvedValueOnce([{ id: 10, name: 'Sakit Jantung', effectType: 'prank' }]);

      const result = await useItem(1, 10, 2); // user 1 uses item 10 on target user 2

      expect(result.success).toBe(true);
      expect(result.effect).toBe('prank');
      
      expect(mockDb.update).toHaveBeenCalledTimes(2); // deduct inventory AND apply effect
    });
  });
});
