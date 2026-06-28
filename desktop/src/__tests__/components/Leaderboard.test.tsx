import React from 'react';
import { render, screen } from '@testing-library/react';
import Leaderboard from '@/components/Leaderboard';
import { getLeaderboard } from '@/actions/gamification';
import { getCurrentMember } from '@/actions/members';

// Mock the actions
jest.mock('@/actions/gamification', () => ({
  getLeaderboard: jest.fn(),
}));

jest.mock('@/actions/members', () => ({
  getCurrentMember: jest.fn(),
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if no current member is found', async () => {
    (getCurrentMember as jest.Mock).mockResolvedValueOnce(null);

    const ui = await Leaderboard();
    
    // Leaderboard returns null if no member is found
    expect(ui).toBeNull();
  });

  it('renders the leaderboard successfully', async () => {
    (getCurrentMember as jest.Mock).mockResolvedValueOnce({
      id: 1,
      cooperativeId: 10,
    });

    (getLeaderboard as jest.Mock).mockResolvedValueOnce([
      { id: 2, namaLengkap: 'Alice Smith', level: 5, xp: 5000 },
      { id: 1, namaLengkap: 'Bob Brown', level: 4, xp: 4000 },
    ]);

    const ui = await Leaderboard();
    render(ui as React.ReactElement);

    expect(screen.getByText('Peringkat Koperasi')).toBeInTheDocument();
    
    // Check if Alice is rendered correctly
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('5000 XP')).toBeInTheDocument();

    // Check if Bob is rendered correctly
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Level 4')).toBeInTheDocument();
    expect(screen.getByText('4000 XP')).toBeInTheDocument();
  });
});
