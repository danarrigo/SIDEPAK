import { getMemberData, getCurrentMember, getActiveMembers, updateCurrentMemberPhone } from '@/actions/members';
import { db } from '@/db';
import { createClient } from '@/utils/supabase/server';

// Mock dependencies
jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Members Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMemberData', () => {
    it('returns null if member not found', async () => {
      ((db as any).where as jest.Mock).mockResolvedValueOnce([]); // Mock empty response for members

      const result = await getMemberData(999);
      expect(result).toBeNull();
    });

    it('returns member and user data if found', async () => {
      const mockMember = { id: 1, userId: 'user-1', namaLengkap: 'John' };
      const mockUser = { id: 'user-1', email: 'john@example.com' };

      // First call for member, second for user
      ((db as any).where as jest.Mock)
        .mockResolvedValueOnce([mockMember])
        .mockResolvedValueOnce([mockUser]);

      const result = await getMemberData(1);
      
      expect(result).toEqual({ ...mockMember, user: mockUser });
    });
    
    it('handles database error gracefully', async () => {
      ((db as any).where as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));
      const result = await getMemberData(1);
      expect(result).toBeNull();
    });
  });

  describe('getCurrentMember', () => {
    it('returns null if no authenticated user', async () => {
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getCurrentMember();
      expect(result).toBeNull();
    });

    it('returns null if member record not found for user', async () => {
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      ((db as any).where as jest.Mock).mockResolvedValueOnce([]); // No member found

      const result = await getCurrentMember();
      expect(result).toBeNull();
    });

    it('returns member data without cooperative if cooperativeId is null', async () => {
      const mockUser = { id: 'user-1', email: 'john@example.com' };
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      
      const mockMember = { id: 1, userId: 'user-1', cooperativeId: null };
      ((db as any).where as jest.Mock).mockResolvedValueOnce([mockMember]);

      const result = await getCurrentMember();
      expect(result).toEqual({
        ...mockMember,
        koperasi: null,
        user: { email: mockUser.email },
      });
    });
  });

  describe('getActiveMembers', () => {
    it('returns active members for a cooperative', async () => {
      const mockMembers = [{ id: 1 }, { id: 2 }];
      ((db as any).where as jest.Mock).mockResolvedValueOnce(mockMembers);

      const result = await getActiveMembers(1);
      expect(result).toEqual(mockMembers);
    });

    it('returns empty array on error', async () => {
      ((db as any).where as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const result = await getActiveMembers(1);
      expect(result).toEqual([]);
    });
  });

  describe('updateCurrentMemberPhone', () => {
    it('returns error if not authenticated', async () => {
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateCurrentMemberPhone('081234567890');
      expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('returns error if member not found', async () => {
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      ((db as any).where as jest.Mock).mockResolvedValueOnce([]); // No member found

      const result = await updateCurrentMemberPhone('081234567890');
      expect(result).toEqual({ success: false, error: 'Member not found' });
    });

    it('updates phone number successfully', async () => {
      const mockSupabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      ((db as any).where as jest.Mock)
        .mockResolvedValueOnce([{ id: 1 }]) // Find member
        .mockResolvedValueOnce([{ id: 1 }]); // Update return

      const result = await updateCurrentMemberPhone('081234567890');
      expect(result).toEqual({ success: true });
    });
  });
});
