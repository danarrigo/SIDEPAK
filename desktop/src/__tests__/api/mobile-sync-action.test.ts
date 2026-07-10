 
 
/**
 * Tests for POST /api/mobile-sync/action
 *
 * Verifies routing of all action types to the correct server action,
 * including the new Phase 1-4 actions:
 *   - list-marketplace-item, buy-marketplace-item (P2P marketplace)
 *   - join-event, create-event (events system)
 *   - matchmake-battle (weekly PvP)
 */

// All mocks use the inline-factory + globalThis pattern so jest.mock
// hoisting (which runs before top-level consts) works correctly.

 
jest.mock('@/db', () => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ id: 1, cooperativeId: 1 }]),
  };
  (globalThis as any).__mockDb = chain;
  return { db: chain };
 
});

 
jest.mock('@/utils/supabase/client-api', () => {
  const mockGetUser = jest.fn();
  (globalThis as any).__mockGetUser = mockGetUser;
  return {
    createSupabaseClient: () => ({ auth: { getUser: mockGetUser } }),
  };
 
});

 
jest.mock('next/headers', () => {
  const mockHeadersGet = jest.fn();
  (globalThis as any).__mockHeadersGet = mockHeadersGet;
  return { headers: jest.fn().mockResolvedValue({ get: mockHeadersGet }) };
 
});

// Server action mocks — declared via jest.mock with inline factories.
 
jest.mock('@/actions/shop', () => {
  const fns = {
    buyShopItem: jest.fn().mockResolvedValue({ success: true }),
    listMarketplaceItem: jest.fn().mockResolvedValue({ success: true }),
    buyMarketplaceItem: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 
jest.mock('@/actions/gamification', () => {
  const fns = { useItem: jest.fn().mockResolvedValue({ success: true }) };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 

 
jest.mock('@/actions/arena', () => {
  const fns = { matchmakeWeeklyBattle: jest.fn().mockResolvedValue({ success: true }) };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 
jest.mock('@/actions/governance', () => {
  const fns = {
    castVote: jest.fn().mockResolvedValue({ success: true }),
    submitProposal: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 
jest.mock('@/actions/quests', () => {
  const fns = { claimQuestReward: jest.fn().mockResolvedValue({ success: true }) };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 
jest.mock('@/actions/wallet', () => {
  const fns = {
    createTopUpInvoice: jest.fn().mockResolvedValue({ success: true }),
    verifyInvoicePayment: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

 
jest.mock('@/actions/financials', () => {
  const fns = {
    payDuesFromWallet: jest.fn().mockResolvedValue({ success: true }),
    depositSavingsFromWallet: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
 
});

jest.mock('@/actions/notifications', () => {
  const fns = {
    deleteNotification: jest.fn().mockResolvedValue({ success: true }),
    createTestNotification: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
});

jest.mock('@/actions/members', () => {
  const fns = {
    updateCurrentMemberPhone: jest.fn().mockResolvedValue({ success: true }),
  };
  Object.assign((globalThis as any), fns);
  return fns;
});

// Import the route after all mocks are registered
import { POST } from '@/app/api/mobile-sync/action/route';

function makeRequest(body: any) {
  return new Request('http://localhost:3000/api/mobile-sync/action', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function setupAuth() {
  ((globalThis as any).__mockHeadersGet as jest.Mock).mockReturnValue('Bearer fake-jwt');
  ((globalThis as any).__mockGetUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'uuid' } } });
}

describe('POST /api/mobile-sync/action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Marketplace P2P actions (Phase 1)', () => {
    it('list-marketplace-item forwards to listMarketplaceItem with correct fields', async () => {
      setupAuth();
      const res = await POST(makeRequest({
        action: 'list-marketplace-item',
        memberId: 1,
        name: 'Tas',
        description: 'Handmade',
        priceInPoints: 200,
        stock: 3,
        imageUrl: 'https://x.com/i.jpg',
      }));
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect((globalThis as any).listMarketplaceItem).toHaveBeenCalledWith({
        sellerId: 1,
        name: 'Tas',
        description: 'Handmade',
        priceInPoints: 200,
        stock: 3,
        imageUrl: 'https://x.com/i.jpg',
      });
    });

    it('buy-marketplace-item forwards to buyMarketplaceItem with itemId', async () => {
      setupAuth();
      const res = await POST(makeRequest({ action: 'buy-marketplace-item', memberId: 1, itemId: 5 }));
      const json = await res.json();
      expect(json.success).toBe(true);
      expect((globalThis as any).buyMarketplaceItem).toHaveBeenCalledWith(expect.anything(), 5);
    });
  });


  describe('Matchmake action (Phase 4d)', () => {
    it('matchmake-battle forwards to matchmakeWeeklyBattle', async () => {
      setupAuth();
      const res = await POST(makeRequest({ action: 'matchmake-battle', memberId: 1 }));
      expect(res.status).toBe(200);
      expect((globalThis as any).matchmakeWeeklyBattle).toHaveBeenCalled();
    });
  });

  describe('Existing actions (regression)', () => {
    it('vote maps Indonesian labels to internal voteType', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'vote', memberId: 1, proposalId: 1, voteType: 'Setuju' }));
      expect((globalThis as any).castVote).toHaveBeenCalledWith(expect.anything(), 1, 'agree');
    });

    it('vote Tolak maps to reject', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'vote', memberId: 1, proposalId: 1, voteType: 'Tolak' }));
      expect((globalThis as any).castVote).toHaveBeenCalledWith(expect.anything(), 1, 'reject');
    });

    it('toggle-quest forwards to claimQuestReward', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'toggle-quest', memberId: 1, questId: 1 }));
      expect((globalThis as any).claimQuestReward).toHaveBeenCalledWith(expect.anything(), 1);
    });

    it('buy-item forwards to buyShopItem', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'buy-item', memberId: 1, itemId: 2 }));
      expect((globalThis as any).buyShopItem).toHaveBeenCalledWith(expect.anything(), 2);
    });

    it('use-item forwards to useItem with optional targetMemberId', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'use-item', memberId: 1, itemId: 3, targetMemberId: 9 }));
      expect((globalThis as any).useItem).toHaveBeenCalledWith(expect.anything(), 3, 9);
    });

    it('create-topup forwards to createTopUpInvoice', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'create-topup', memberId: 1, amount: 100000 }));
      expect((globalThis as any).createTopUpInvoice).toHaveBeenCalledWith(expect.anything(), 100000);
    });

    it('pay-dues-wallet forwards type', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'pay-dues-wallet', memberId: 1, type: 'monthly' }));
      expect((globalThis as any).payDuesFromWallet).toHaveBeenCalledWith(expect.anything(), 'monthly');
    });

    it('deposit-savings-wallet forwards amount + description', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'deposit-savings-wallet', memberId: 1, amount: 50000, description: 'test' }));
      expect((globalThis as any).depositSavingsFromWallet).toHaveBeenCalledWith(expect.anything(), 50000, 'test');
    });

    it('submit-proposal forwards to submitProposal', async () => {
      setupAuth();
      await POST(makeRequest({ action: 'submit-proposal', memberId: 1, title: 'T', description: 'D' }));
      expect((globalThis as any).submitProposal).toHaveBeenCalledWith(expect.anything(), 'T', 'D');
    });
  });

  it('returns success:false for unknown action', async () => {
    setupAuth();
    const res = await POST(makeRequest({ action: 'nonsense' }));
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  // ============ Auth & security regression tests ============

  it('returns 401 when Authorization header is missing', async () => {
    ((globalThis as any).__mockHeadersGet as jest.Mock).mockReturnValue(null);
    const res = await POST(makeRequest({ action: 'buy-marketplace-item', memberId: 1, itemId: 1 }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/missing/i);
  });

  it('returns 401 when token is rejected by Supabase', async () => {
    ((globalThis as any).__mockHeadersGet as jest.Mock).mockReturnValue('Bearer invalid');
    ((globalThis as any).__mockGetUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token', name: 'AuthError', status: 401 },
    });
    const res = await POST(makeRequest({ action: 'buy-marketplace-item', memberId: 1, itemId: 1 }));
    expect(res.status).toBe(401);
  });

  it('ignores body.memberId — server uses only token-derived memberId', async () => {
    // Attacker sends a forged memberId in body (claims to be member 99)
    // but their token only resolves to member 1.
    setupAuth();
    const res = await POST(
      makeRequest({ action: 'buy-marketplace-item', memberId: 99, itemId: 1 })
    );
    // The action should be called with memberId=1 (from token),
    // NOT memberId=99 (from body).
    expect((globalThis as any).buyMarketplaceItem).toHaveBeenCalledWith(1, 1);
  });

  it('returns 401 for action POST when auth header is malformed', async () => {
    ((globalThis as any).__mockHeadersGet as jest.Mock).mockReturnValue('Token abc');
    const res = await POST(makeRequest({ action: 'buy-marketplace-item', memberId: 1, itemId: 1 }));
    expect(res.status).toBe(401);
  });

  it('returns success payload on a valid request', async () => {
    setupAuth();
    const res = await POST(makeRequest({ action: 'buy-marketplace-item', memberId: 1, itemId: 1 }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
