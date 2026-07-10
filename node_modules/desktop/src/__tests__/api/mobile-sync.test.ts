 
 
/**
 * Tests for GET /api/mobile-sync
 *
 * Verifies that the response includes all data sources the mobile app
 * depends on (Phase 1-4 features). Mocks the database, Supabase client,
 * and all action modules to isolate the route handler logic.
 */

// ---- Mocks: defined inline in jest.mock factories so they are available
//      before our top-level code runs.

 
jest.mock('@/db', () => {
  const chain: any = {
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
    groupBy: jest.fn().mockReturnThis(),
  };
  (globalThis as any).__mockDbChain = chain;
  return { db: chain };
 
});

 
jest.mock('@/utils/supabase/client-api', () => {
  const mockGetUser = jest.fn();
  (globalThis as any).__mockGetUser = mockGetUser;
  return {
    createSupabaseClient: () => ({
      auth: { getUser: mockGetUser },
    }),
  };
 
});

 
jest.mock('next/headers', () => {
  const mockHeadersGet = jest.fn();
  (globalThis as any).__mockHeadersGet = mockHeadersGet;
  return {
    headers: jest.fn().mockResolvedValue({ get: mockHeadersGet }),
  };
 
});

// Mock all action modules to return controlled values.
jest.mock('@/actions/dashboard', () => ({
  getDashboardData: jest.fn().mockResolvedValue({
    progress: { level: 5, pointsBalance: 100, xp: 0, currentStreak: 0, lastActivityDate: null },
    transactions: [],
  }),
  updateStreakOnActivity: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/actions/financials', () => ({
  getFinancialsData: jest.fn().mockResolvedValue({
    savings: [], loans: [], dues: [], walletTransactions: [],
    totalSavings: 0, simpananPokok: 0, simpananWajib: 0, simpananSukarela: 0,
    isMemberActive: true, isPokokPaid: true, isWajibPaidThisMonth: true, pendingWajibAmount: 0,
  }),
  getActiveLoan: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/actions/quests', () => ({
  getActiveQuests: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/actions/governance', () => ({
  getGovernanceData: jest.fn().mockResolvedValue({
    activeProposals: [], pastProposals: [], totalMembers: 0,
    totalAsetDesa: 0, asetPinjaman: 0, asetKas: 0, asetInvestasi: 0,
  }),
  getKoperasiStats: jest.fn().mockResolvedValue({
    transaksi: 0, anggotaBaru: 0, omzetHarian: 0, umkmAktif: 0,
  }),
}));

jest.mock('@/actions/arena', () => ({
  getArenaData: jest.fn().mockResolvedValue({ activeBattles: [] }),
  getBattleHistory: jest.fn().mockResolvedValue({ pastBattles: [] }),
  getMemberStats: jest.fn().mockResolvedValue({
    missionsCompleted: 0,
    totalSavings: 0,
    savingsPts: 0,
    activeStreak: 0,
    eventsJoined: 0,
    shopPurchases: 0,
    marketplaceActivity: 0,
    loansCount: 0,
    battlesWon: 0,
  }),
}));

jest.mock('@/actions/gamification', () => ({
  getMemberBadges: jest.fn().mockResolvedValue([]),
  getWinRate: jest.fn().mockResolvedValue({ winRate: 0, totalBattles: 0 }),
  getStoreItems: jest.fn().mockResolvedValue([]),
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardProvincial: jest.fn().mockResolvedValue([]),
  getLeaderboardNational: jest.fn().mockResolvedValue([]),
  getMemberInventory: jest.fn().mockResolvedValue([]),
}));

 
jest.mock('@/actions/shop', () => {
  const getMarketplaceItems = jest.fn().mockResolvedValue([
    { id: 1, name: 'X', priceInPoints: 10, stock: 1, sellerId: 2, seller: { namaLengkap: 'Andi' } },
  ]);
  (globalThis as any).__mockGetMarketplaceItems = getMarketplaceItems;
  return { getMarketplaceItems };
 
});

 
jest.mock('@/actions/events', () => {
  const getEventsByCooperative = jest.fn().mockResolvedValue({
    events: [{ id: 1, name: 'E', startDate: new Date(), endDate: new Date(), cooperativeId: 1 }],
 
  });
  const getMemberEventParticipations = jest.fn().mockResolvedValue({
    participations: [{ event: { id: 1 } }],
  });
  Object.assign((globalThis as any), { getEventsByCooperative, getMemberEventParticipations });
  return { getEventsByCooperative, getMemberEventParticipations };
});

 
jest.mock('@/actions/members', () => {
  const getActiveMembers = jest.fn().mockResolvedValue([{ id: 2, namaLengkap: 'Andi' }]);
  const getCurrentMember = jest.fn().mockResolvedValue({ id: 1, cooperativeId: 1, provinsi: 'Jawa Barat' });
  Object.assign((globalThis as any), { getActiveMembers, getCurrentMember });
  return { getActiveMembers, getCurrentMember };
 
});

jest.mock('@/actions/notifications', () => {
  const getMemberNotifications = jest.fn().mockResolvedValue([]);
  Object.assign((globalThis as any), { getMemberNotifications });
  return { getMemberNotifications };
});

import { GET } from '@/app/api/mobile-sync/route';

describe('GET /api/mobile-sync', () => {
  const mockGetUser = (globalThis as any).__mockGetUser as jest.Mock;
  const mockHeadersGet = (globalThis as any).__mockHeadersGet as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setupAuth() {
    mockHeadersGet.mockReturnValue('Bearer fake-jwt-token');
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-uuid' } } });
  }

  it('returns 200 + success:true with all expected data fields', async () => {
    setupAuth();

    // The route also does an inline db query for the current member (line 31)
    // to populate currentProvinsi. Mock the first .where() call to return the member.
    const mockDbChain = (globalThis as any).__mockDbChain;
    mockDbChain.where.mockResolvedValueOnce([
      { id: 1, cooperativeId: 1, provinsi: 'Jawa Barat' },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();

    // All Phase 1-4 fields must be present in the response payload
    expect(json.data).toHaveProperty('marketplaceItems');
    expect(json.data).toHaveProperty('events');
    expect(json.data).toHaveProperty('joinedEventIds');
    expect(json.data).toHaveProperty('leaderboardByProvinsi');
    expect(json.data).toHaveProperty('leaderboardByNasional');
    expect(json.data).toHaveProperty('activeMembers');
    expect(json.data).toHaveProperty('activeLoan');
    expect(json.data).toHaveProperty('activeEffect');

    // Verify action functions were called and data flowed through
    expect((globalThis as any).__mockGetMarketplaceItems).toHaveBeenCalled();
    expect(json.data.marketplaceItems).toHaveLength(1);
    expect(json.data.marketplaceItems[0].name).toBe('X');
    expect(json.data.events).toHaveLength(1);
    expect(json.data.joinedEventIds).toEqual([1]);
    expect(json.data.activeMembers).toHaveLength(1);
    expect(json.data.activeMembers[0].namaLengkap).toBe('Andi');
  });

  it('returns 500 on internal error', async () => {
    mockHeadersGet.mockImplementation(() => { throw new Error('boom'); });
    const response = await GET();
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });

  // ============ Auth & security regression tests ============

  it('returns 401 when Authorization header is missing', async () => {
    mockHeadersGet.mockReturnValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/missing/i);
  });

  it('returns 401 when Authorization header is not Bearer scheme', async () => {
    mockHeadersGet.mockReturnValue('Basic dXNlcjpwYXNz');
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('returns 401 when Supabase rejects the token', async () => {
    mockHeadersGet.mockReturnValue('Bearer invalid-token-123');
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token', name: 'AuthError', status: 401 },
    });
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/invalid|expired/i);
  });

  it('returns 401 when Supabase returns null user (silent failure)', async () => {
    mockHeadersGet.mockReturnValue('Bearer stale-token-456');
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('returns 403 when token is valid but no member profile exists', async () => {
    mockHeadersGet.mockReturnValue('Bearer valid-but-orphan-token');
    mockGetUser.mockResolvedValue({ data: { user: { id: 'orphan-uuid' } }, error: null });
    // No need to mock .where — but to be safe, return empty array
    ((globalThis as any).__mockDbChain as any).where.mockResolvedValueOnce([]);
    const response = await GET();
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/profile|anggota/i);
  });

  it('OPTIONS returns 204 with CORS headers', async () => {
    const { OPTIONS } = await import('@/app/api/mobile-sync/route');
    const response = await OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
