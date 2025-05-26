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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { SkeletonChart } from '../../../ui/components/Skeleton';
import type { GradientDistribution as GradientDistributionType } from '../../../core/types/race';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
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
  
  const createOptions = (data: GradientDistributionType['ascent'] | GradientDistributionType['descent']): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20, // Add more top padding for labels
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
            const distance = data[context.dataIndex].distance;
            return [
              `${context.parsed.y.toFixed(1)}%`,
              `${distance.toFixed(1)} km`,
            ];
          },
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        offset: 4,
        color: '#666',
        font: {
          size: 11,
          weight: 'bold',
        },
        formatter: (value: number) => {
          return value > 5 ? `${value.toFixed(0)}%` : '';
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
        ) * 1.3, // Increase max to make room for labels
      },
    },
  });
  
  const ascentOptions = useMemo(() => createOptions(distribution.ascent), [distribution]);
  const descentOptions = useMemo(() => createOptions(distribution.descent), [distribution]);
  
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
          <Bar data={ascentData} options={ascentOptions} />
        </div>
      </GlassPanel>
      
      <GlassPanel padding="sm" className="h-full flex flex-col">
        <h4 className="text-sm font-semibold text-[#121212] dark:text-[#f1f4f8] mb-2">
          {t('race.descentDistribution')}
        </h4>
        <div className="flex-1 relative">
          <Bar data={descentData} options={descentOptions} />
        </div>
      </GlassPanel>
    </div>
  );
};