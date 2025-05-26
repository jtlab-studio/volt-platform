import React, { useMemo } from 'react';
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
  Legend
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
  
  const chartData = useMemo(() => {
    // Sample the data to reduce points if too many
    const maxPoints = 200;
    let distances = profile.distance;
    let elevations = profile.elevation;
    
    if (profile.distance.length > maxPoints) {
      const step = Math.floor(profile.distance.length / maxPoints);
      distances = profile.distance.filter((_, i) => i % step === 0);
      elevations = profile.elevation.filter((_, i) => i % step === 0);
    }
    
    return {
      labels: distances,
      datasets: [
        {
          label: t('race.elevation'),
          data: elevations,
          fill: false,
          backgroundColor: 'transparent',
          borderColor: '#ff9800',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.4,
          // Disable point labels
          pointHitRadius: 10,
          pointHoverBackgroundColor: '#ff9800',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [profile, t]);
  
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
        displayColors: false,
        callbacks: {
          title: (context) => {
            const value = context[0].parsed.x;
            return `${t('race.distance')}: ${value.toFixed(2)} km`;
          },
          label: (context) => {
            return `${t('race.elevation')}: ${context.parsed.y.toFixed(0)} m`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
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
          maxTicksLimit: 10,
          callback: function(value) {
            return value.toFixed(1);
          }
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
        ticks: {
          callback: function(value) {
            return value.toFixed(0);
          }
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }), [t]);
  
  if (isLoading) {
    return <SkeletonChart />;
  }
  
  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
        {t('race.elevationProfile')}
        {profile.smoothed && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({t('race.smoothedWindow', { size: profile.windowSize })})
          </span>
        )}
      </h3>
      <div className="h-[400px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </GlassPanel>
  );
};
