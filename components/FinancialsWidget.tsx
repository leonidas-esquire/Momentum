import React, { useMemo, useContext } from 'react';
import { Financials, User, Team } from '../types';
import { Icon } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface FinancialsWidgetProps {
  financials: Financials;
  allUsers: User[];
  teams: Team[];
}

export const FinancialsWidget: React.FC<FinancialsWidgetProps> = ({ financials, allUsers, teams }) => {
  const { t } = useContext(LanguageContext)!;

  const { totalRevenue, net, status, statusColor, statusIcon, progressPercentage } = useMemo(() => {
    const proUsersCount = allUsers.filter(u => u.subscription.plan === 'pro' && u.subscription.status === 'active').length;
    const teamMembersCount = teams.reduce((acc, team) => {
        if (team.subscriptionStatus === 'active') {
            return acc + team.members.length;
        }
        return acc;
    }, 0);

    const proRevenue = proUsersCount * financials.revenuePerProUser;
    const teamRevenue = teamMembersCount * financials.revenuePerTeamMember;
    const totalRevenue = proRevenue + teamRevenue;

    const net = totalRevenue - financials.monthlyCosts;
    
    let status = t('financialsWidget.loss');
    let statusColor = 'text-brand-danger';
    let statusIcon = 'trending-down';
    if (net > 0) {
      status = t('financialsWidget.profitable');
      statusColor = 'text-brand-safe';
      statusIcon = 'trending-up';
    } else if (net === 0) {
      status = t('financialsWidget.breakEven');
      statusColor = 'text-brand-warning';
      statusIcon = 'scale';
    }
    
    const progressPercentage = financials.monthlyCosts > 0 ? Math.min((totalRevenue / financials.monthlyCosts) * 100, 100) : 0;

    return { totalRevenue, net, status, statusColor, statusIcon, progressPercentage };
  }, [financials, allUsers, teams, t]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  return (
    <div className="bg-brand-surface border border-brand-secondary rounded-xl p-6 mb-8 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
        <Icon name="scale" className="w-6 h-6 text-brand-text-muted" />
        {t('financialsWidget.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-bg p-4 rounded-lg flex items-center gap-3">
          <Icon name="cash" className="w-8 h-8 text-brand-safe" />
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-brand-text-muted">{t('financialsWidget.revenue')}</p>
          </div>
        </div>
        <div className="bg-brand-bg p-4 rounded-lg flex items-center gap-3">
          <Icon name="server" className="w-8 h-8 text-brand-warning" />
          <div>
            <p className="text-2xl font-bold">{formatCurrency(financials.monthlyCosts)}</p>
            <p className="text-sm text-brand-text-muted">{t('financialsWidget.costs')}</p>
          </div>
        </div>
        <div className="bg-brand-bg p-4 rounded-lg flex items-center gap-3">
          <Icon name={statusIcon} className={`w-8 h-8 ${statusColor}`} />
          <div>
            <p className={`text-2xl font-bold ${statusColor}`}>{formatCurrency(net)}</p>
            <p className="text-sm text-brand-text-muted">{t('financialsWidget.net')}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-semibold text-brand-text-muted">{t('financialsWidget.profitabilityGoal')}</span>
            <span className={`text-sm font-bold ${statusColor}`}>{status}</span>
        </div>
        <div className="w-full bg-brand-bg rounded-full h-4 border border-brand-secondary p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${net > 0 ? 'bg-brand-safe' : 'bg-brand-primary'}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};