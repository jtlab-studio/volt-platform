import React, { useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { SkeletonChart } from '../../../ui/components/Skeleton';
import type { ElevationProfile } from '../../../core/types/race';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ElevationChartProps {
  profile: ElevationProfile;
  isLoading?: boolean;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  profile,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  
  useEffect(() => {
    console.log('=== ELEVATION CHART DATA ===');
    console.log('Profile points:', profile.distance.length);
    console.log('Distance range:', profile.distance[0], 'to', profile.distance[profile.distance.length - 1]);
    console.log('Elevation range:', Math.min(...profile.elevation), 'to', Math.max(...profile.elevation));
    console.log('Smoothed:', profile.smoothed);
    console.log('Window size:', profile.windowSize);
    console.log('========================');
  }, [profile]);
  
  const chartData = useMemo(() => ({
    labels: profile.distance.map((d) => d.toFixed(1)),
    datasets: [
      {
        label: t('race.elevation'),
        data: profile.elevation,
        fill: true,
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: profile.smoothed ? 0.4 : 0,
      },
    ],
  }), [profile, t]);
  
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return `${t('race.distance')}: ${profile.distance[index].toFixed(2)} km`;
          },
          label: (context) => {
            return `${t('race.elevation')}: ${context.parsed.y.toFixed(0)} m`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: `${t('race.distance')} (km)`,
          color: '#666',
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 20,
          autoSkip: true,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `${t('race.elevation')} (m)`,
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }), [profile, t]);
  
  if (isLoading) {
    return <SkeletonChart />;
  }
  
  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
        {t('race.elevationProfile')}
      </h3>
      <div className="h-[400px] w-full">
        <Line data={chartData} options={options} />
      </div>
      {profile.smoothed && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('race.smoothedWindow', { size: profile.windowSize })}
        </p>
      )}
    </GlassPanel>
  );
};
