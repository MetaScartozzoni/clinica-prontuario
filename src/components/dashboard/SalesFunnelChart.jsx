import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesFunnelChart = ({ data }) => {
  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as it's a single dataset funnel
      },
      title: {
        display: false, // Title is handled by CardTitle
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          precision: 0, // Ensure whole numbers for counts
        }
      },
      y: {
        grid: {
          display: false,
        },
      }
    },
    elements: {
      bar: {
        borderRadius: 5,
        borderSkipped: false, // Apply borderRadius to all sides
      }
    }
  };

  // Ensure data is structured correctly for Chart.js
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      // Make bars progressively narrower to simulate funnel shape
      // This is a visual trick; actual funnel libraries might do this differently
      barThickness: dataset.data.map((_, i) => Math.max(10, 60 - i * 8)), 
    }))
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[350px] md:h-[400px] p-4" // Adjust height as needed
    >
      {data && data.labels && data.datasets ? (
         <Bar options={options} data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando dados do funil...</p>
        </div>
      )}
    </motion.div>
  );
};

export default SalesFunnelChart;