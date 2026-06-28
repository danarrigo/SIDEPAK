import { createEvent, joinEvent } from '@/actions/events';
import { db } from '@/db';

const mockDb = db as unknown as Record<string, jest.Mock>;

jest.mock('@/db', () => {
  const mDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  };
  return { db: mDb };
});

describe('Events Actions', () => {
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

  describe('createEvent', () => {
    it('fails if member progress is missing or level is below 20', async () => {
      // Return member with level 10
      mockDb.where.mockResolvedValueOnce([{ memberId: 1, level: 10 }]);

      const result = await createEvent(1, 'Senam Pagi', 'Deskripsi senam', new Date(), new Date());

      expect(result.success).toBe(false);
      expect(result.error).toContain('Level tidak mencukupi');
    });

    it('fails if member is not found or has no cooperative', async () => {
      // Progress query returns level 25 (success)
      mockDb.where.mockResolvedValueOnce([{ memberId: 1, level: 25 }]);
      // Member query returns empty
      mockDb.where.mockResolvedValueOnce([]);

      const result = await createEvent(1, 'Senam Pagi', 'Deskripsi senam', new Date(), new Date());

      expect(result.success).toBe(false);
      expect(result.error).toContain('tidak terdaftar pada koperasi');
    });

    it('creates an event successfully for level 20+ member', async () => {
      // Progress query returns level 25
      mockDb.where.mockResolvedValueOnce([{ memberId: 1, level: 25 }]);
      // Member query returns member with cooperativeId 5
      mockDb.where.mockResolvedValueOnce([{ id: 1, cooperativeId: 5 }]);

      const result = await createEvent(1, 'Senam Pagi', 'Deskripsi', new Date(), new Date());

      expect(result.success).toBe(true);
      expect(result.message).toContain('Berhasil');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('joinEvent', () => {
    it('fails if event does not exist', async () => {
      // Event query returns empty
      mockDb.where.mockResolvedValueOnce([]);

      const result = await joinEvent(1, 99);

      expect(result.success).toBe(false);
      expect(result.error).toContain('tidak ditemukan');
    });

    it('fails if user is already registered', async () => {
      // Event query returns event
      mockDb.where.mockResolvedValueOnce([{ id: 99 }]);
      // Participation query returns existing record
      mockDb.where.mockResolvedValueOnce([{ id: 5, memberId: 1, eventId: 99 }]);

      const result = await joinEvent(1, 99);

      expect(result.success).toBe(false);
      expect(result.error).toContain('sudah terdaftar');
    });

    it('joins event successfully', async () => {
      // Event query returns event
      mockDb.where.mockResolvedValueOnce([{ id: 99 }]);
      // Participation query returns empty (not joined yet)
      mockDb.where.mockResolvedValueOnce([]);

      const result = await joinEvent(1, 99);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Berhasil mendaftar');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
