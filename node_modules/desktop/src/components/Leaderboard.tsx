import React from 'react';
import { getLeaderboard, getLeaderboardProvincial, getLeaderboardNational } from '@/actions/gamification';
import { getCurrentMember } from '@/actions/members';
import LeaderboardClient from './LeaderboardClient';

export default async function Leaderboard() {
  const currentMember = await getCurrentMember();
  if (!currentMember || !currentMember.cooperativeId) return null;

  const topMembers = await getLeaderboard(currentMember.cooperativeId as number);
  const provinsiMembers = currentMember.provinsi ? await getLeaderboardProvincial(currentMember.provinsi as string) : [];
  const nasionalMembers = await getLeaderboardNational();

  return (
    <LeaderboardClient 
      memberId={currentMember.id}
      koperasiData={topMembers}
      provinsiData={provinsiMembers}
      nasionalData={nasionalMembers}
    />
  );
}
