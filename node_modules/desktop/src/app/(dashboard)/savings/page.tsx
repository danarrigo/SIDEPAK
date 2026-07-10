import React from 'react';
import { getCurrentMember } from '@/actions/members';
import { getFinancialsData } from '@/actions/financials';
import { getDashboardData } from '@/actions/dashboard';
import { redirect } from 'next/navigation';
import SavingsClient from './SavingsClient';

export default async function SavingsPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect('/login');

  const financials = await getFinancialsData(currentMember.id);
  const dashboardData = await getDashboardData(currentMember.id);

  const walletBalance = dashboardData?.progress?.walletBalance || 0;

  return (
    <SavingsClient 
      memberId={currentMember.id}
      walletBalance={walletBalance}
      financials={financials}
    />
  );
}
