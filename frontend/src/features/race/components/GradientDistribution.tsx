import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { SkeletonChart } from '../../../ui/components/Skeleton';
import { CHART_OPTIONS } from '../../../core/config/constants';
import type { GradientDistribution as GradientDistributionType } from '../../../core/types/race';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GradientDistributionProps {
  distribution: GradientDistributionType;
  isLoading?: boolean;
}

export const GradientDistribution: React.FC<GradientDistributionProps> = ({
  distribution,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  
  const ascentData = useMemo(() => ({
    labels: distribution.ascent.map((bin) => bin.range),
    datasets: [
      {
        label: t('race.ascent'),
        data: distribution.ascent.map((bin) => bin.percentage),
        backgroundColor: '#249689',
        borderRadius: 8,
      },
    ],
  }), [distribution.ascent, t]);
  
  const descentData = useMemo(() => ({
    labels: distribution.descent.map((bin) => bin.range),
    datasets: [
      {
        label: t('race.descent'),
        data: distribution.descent.map((bin) => bin.percentage),
        backgroundColor: '#dc143c',
        borderRadius: 8,
      },
    ],
  }), [distribution.descent, t]);
  
  const options: ChartOptions<'bar'> = useMemo(() => ({
    ...CHART_OPTIONS,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const distance = context.dataset === ascentData.datasets[0]
              ? distribution.ascent[context.dataIndex].distance
              : distribution.descent[context.dataIndex].distance;
            return [
              `${context.parsed.y.toFixed(1)}%`,
              `${distance.toFixed(1)} km`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: `${t('race.gradient')} (%)`,
          color: '#666',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: t('race.percentage'),
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        max: 100,
      },
    },
  }), [distribution, ascentData.datasets, t]);
  
  if (isLoading) {
    return <SkeletonChart />;
  }
  
  return (
    <div className="space-y-4">
      <GlassPanel>
        <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
          {t('race.ascentDistribution')}
        </h3>
        <div className="h-[200px]">
          <Bar data={ascentData} options={options} />
        </div>
      </GlassPanel>
      
      <GlassPanel>
        <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
          {t('race.descentDistribution')}
        </h3>
        <div className="h-[200px]">
          <Bar data={descentData} options={options} />
        </div>
      </GlassPanel>
    </div>
  );
};
