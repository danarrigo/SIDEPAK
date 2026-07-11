import { POST } from '@/app/api/withdraw/route';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';

// Mock Next.js Request
const mockRequest = (body: any) => {
  return new Request('http://localhost/api/withdraw', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// Mock dependencies
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  },
}));

jest.mock('xendit-node', () => {
  return {
    Xendit: jest.fn().mockImplementation(() => ({
      Payout: {
        createPayout: jest.fn().mockResolvedValue({ id: 'payout-1', status: 'ACCEPTED' }),
      },
    })),
  };
});

describe('POST /api/withdraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = mockRequest({ amount: 50000 });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns 404 if member not found', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    ((db as any).where as jest.Mock).mockResolvedValueOnce([]); // No member found

    const req = mockRequest({ amount: 50000 });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ success: false, error: 'Member not found' });
  });

  it('returns 400 if amount is less than 10000', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    ((db as any).where as jest.Mock).mockResolvedValueOnce([{ id: 1 }]); // Member found

    const req = mockRequest({ amount: 5000 });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'Minimal penarikan adalah Rp 10.000' });
  });

  it('processes withdrawal successfully', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    ((db as any).where as jest.Mock).mockResolvedValueOnce([{ id: 1, namaLengkap: 'John Doe' }]); // Member found
    ((db as any).where as jest.Mock).mockResolvedValueOnce([{ memberId: 1, walletBalance: 100000 }]); // memberProgress found
    ((db as any).returning as jest.Mock).mockResolvedValueOnce([{ id: 1, amount: 50000 }]); // Insert returning

    const req = mockRequest({ 
      amount: 50000,
      bankCode: 'ID_BCA',
      accountNumber: '12345',
      accountName: 'John Doe'
    });
    
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    
    // Check if db.insert was called once (disbursements)
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('handles server error gracefully', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockRejectedValue(new Error('Auth Error')) },
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const req = mockRequest({ amount: 50000 });
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
