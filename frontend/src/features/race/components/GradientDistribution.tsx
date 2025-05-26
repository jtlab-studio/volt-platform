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
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 40,
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
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  }), [distribution.descent, t]);
  
  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 0,
        left: 10,
        right: 10,
      },
    },
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
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 2,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        max: Math.max(
          Math.max(...distribution.ascent.map(d => d.percentage)),
          Math.max(...distribution.descent.map(d => d.percentage))
        ) * 1.2,
      },
    },
  }), [distribution, ascentData.datasets, t]);
  
  if (isLoading) {
    return (
      <div className="h-[200px]">
        <SkeletonChart />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-4 h-[200px]">
      <GlassPanel padding="sm" className="h-full flex flex-col">
        <h4 className="text-sm font-semibold text-[#121212] dark:text-[#f1f4f8] mb-2">
          {t('race.ascentDistribution')}
        </h4>
        <div className="flex-1 relative">
          <Bar data={ascentData} options={options} />
          {/* Show percentage labels on bars */}
          <div className="absolute inset-0 pointer-events-none flex items-end justify-around px-4 pb-8">
            {distribution.ascent.map((bin, idx) => (
              <div key={idx} className="text-xs font-medium text-white mix-blend-normal" style={{ width: `${100 / distribution.ascent.length}%`, textAlign: 'center' }}>
                {bin.percentage > 5 && `${bin.percentage.toFixed(0)}%`}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
      
      <GlassPanel padding="sm" className="h-full flex flex-col">
        <h4 className="text-sm font-semibold text-[#121212] dark:text-[#f1f4f8] mb-2">
          {t('race.descentDistribution')}
        </h4>
        <div className="flex-1 relative">
          <Bar data={descentData} options={options} />
          {/* Show percentage labels on bars */}
          <div className="absolute inset-0 pointer-events-none flex items-end justify-around px-4 pb-8">
            {distribution.descent.map((bin, idx) => (
              <div key={idx} className="text-xs font-medium text-white mix-blend-normal" style={{ width: `${100 / distribution.descent.length}%`, textAlign: 'center' }}>
                {bin.percentage > 5 && `${bin.percentage.toFixed(0)}%`}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
