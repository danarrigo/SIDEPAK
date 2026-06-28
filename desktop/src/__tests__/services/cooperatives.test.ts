import { CooperativesService } from '@/services/cooperatives.service';
import { db } from '@/db';

const mockDb = db as unknown as Record<string, jest.Mock>;

// Mock the db module
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

describe('CooperativesService', () => {
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

  describe('create', () => {
    it('inserts a new cooperative and returns it', async () => {
      const mockCoop = { id: 1, name: 'Test Koperasi', code: 'TEST1234', address: 'Jl. Test', isVerified: true };
      
      // Setup the mock chain to eventually return the data on .returning()
      mockDb.returning.mockResolvedValueOnce([mockCoop]);

      const dataToInsert = { name: 'Test Koperasi', code: 'TEST1234', address: 'Jl. Test' };
      const result = await CooperativesService.create(dataToInsert);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(dataToInsert);
      expect(mockDb.returning).toHaveBeenCalled();
      
      expect(result).toEqual(mockCoop);
    });
  });

  describe('getById', () => {
    it('returns a cooperative by its ID', async () => {
      const mockCoop = { id: 5, name: 'Koperasi Lima' };
      
      // Setup the mock chain to return data on .where()
      mockDb.where.mockResolvedValueOnce([mockCoop]);

      const result = await CooperativesService.getById(5);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      
      expect(result).toEqual(mockCoop);
    });

    it('returns undefined if not found', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      const result = await CooperativesService.getById(99);
      expect(result).toBeUndefined();
    });
  });
});
