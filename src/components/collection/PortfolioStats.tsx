import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import type { CollectionCard } from '../../types';

interface PortfolioStatsProps {
  collection: CollectionCard[];
}

export function PortfolioStats({ collection }: PortfolioStatsProps) {
  const totalValue = collection.reduce(
    (sum, card) => sum + card.marketValue * card.quantity,
    0
  );

  const totalCost = collection.reduce(
    (sum, card) => sum + (card.purchasePrice || 0) * card.quantity,
    0
  );

  const profitLoss = totalValue - totalCost;
  const profitLossPercentage = (profitLoss / totalCost) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-secondary-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Profit/Loss</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatCurrency(profitLoss)}</p>
              <span className={`text-sm ${profitLoss >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            profitLoss >= 0 ? 'bg-success-100' : 'bg-error-100'
          }`}>
            {profitLoss >= 0 ? (
              <TrendingUp className="h-6 w-6 text-success-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-error-600" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}