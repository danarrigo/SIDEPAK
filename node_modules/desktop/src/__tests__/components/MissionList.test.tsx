import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MissionList from '@/components/MissionList';
import { claimQuestReward } from '@/actions/quests';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('@/actions/quests', () => ({
  claimQuestReward: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('MissionList Component', () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
  });

  const mockQuests = [
    {
      id: 1,
      frequency: 'daily',
      title: 'Login Hari Ini',
      targetCount: 1,
      rewardPoints: 50,
      progress: { progress: 0, isCompleted: false },
    },
    {
      id: 2,
      frequency: 'daily',
      title: 'Bayar Iuran Harian',
      targetCount: 1,
      rewardPoints: 100,
      progress: { progress: 1, isCompleted: false }, // Claimable!
    },
    {
      id: 3,
      frequency: 'daily',
      title: 'Beli Barang di Toko',
      targetCount: 3,
      rewardPoints: 150,
      progress: { progress: 3, isCompleted: true }, // Already fully completed
    },
  ];

  it('renders incomplete quest correctly', () => {
    render(<MissionList initialQuests={[mockQuests[0]]} memberId={1} />);
    
    expect(screen.getByText('Login Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Progres: 0 / 1')).toBeInTheDocument();
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /KLAIM/i })).not.toBeInTheDocument();
  });

  it('renders claimable quest correctly and handles claim action', async () => {
    (claimQuestReward as jest.Mock).mockResolvedValueOnce({ success: true });
    
    render(<MissionList initialQuests={[mockQuests[1]]} memberId={1} />);
    
    expect(screen.getByText('Bayar Iuran Harian')).toBeInTheDocument();
    
    const claimButton = screen.getByRole('button', { name: /KLAIM/i });
    expect(claimButton).toBeInTheDocument();

    fireEvent.click(claimButton);

    expect(claimButton).toBeDisabled(); // Should disable while loading
    
    await waitFor(() => {
      expect(claimQuestReward).toHaveBeenCalledWith(1, 2); // memberId=1, questId=2
      expect(mockRefresh).toHaveBeenCalled(); // Should refresh on success
    });
  });

  it('handles claim error gracefully', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (claimQuestReward as jest.Mock).mockResolvedValueOnce({ success: false, error: 'Custom Error' });
    
    render(<MissionList initialQuests={[mockQuests[1]]} memberId={1} />);
    
    const claimButton = screen.getByRole('button', { name: /KLAIM/i });
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(claimQuestReward).toHaveBeenCalledWith(1, 2);
      expect(window.alert).toHaveBeenCalledWith('Custom Error');
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it('renders fully completed quest correctly', () => {
    render(<MissionList initialQuests={[mockQuests[2]]} memberId={1} />);
    
    expect(screen.getByText('Beli Barang di Toko')).toHaveClass('line-through');
    expect(screen.getByText('SELESAI')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /KLAIM/i })).not.toBeInTheDocument();
  });
});
