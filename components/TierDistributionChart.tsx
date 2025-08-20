'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface TierDistributionChartProps {
  data: {
    subject: string
    green: number
    orange: number
    red: number
    gray: number
  }[]
}

export function TierDistributionChart({ data }: TierDistributionChartProps) {
  const chartData = {
    labels: data.map(item => item.subject),
    datasets: [
      {
        label: 'Green (≥85)',
        data: data.map(item => item.green),
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
      {
        label: 'Orange (75-84)',
        data: data.map(item => item.orange),
        backgroundColor: '#f97316',
        borderColor: '#f97316',
        borderWidth: 1,
      },
      {
        label: 'Red (65-74)',
        data: data.map(item => item.red),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
      {
        label: 'Gray (<65)',
        data: data.map(item => item.gray),
        backgroundColor: '#6b7280',
        borderColor: '#6b7280',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
