import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PredictionModal({ isOpen, onClose, predictions, historicalData, item, ciudad }) {
  // Extraemos las fechas de los datos históricos y de las predicciones
  const historicalDates = historicalData?.map(item => item.fecha) || [];
  const predictionDates = predictions?.map(pred => pred.fecha_referencia) || [];
  const allDates = [...historicalDates, ...predictionDates];
  
  // Obtenemos las fechas únicas ordenadas
  const uniqueDates = [...new Set(allDates)];
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));
  
  // Creamos mapas para acceder rápidamente a las ventas
  const historicalSalesMap = {};
  historicalData?.forEach(item => {
    historicalSalesMap[item.fecha] = item.sales;
  });
  
  const predictedSalesMap = {};
  predictions?.forEach(pred => {
    predictedSalesMap[pred.fecha_referencia] = pred.ventas_predichas;
  });
  
  // Creamos arreglos de datos alineados a uniqueDates (null donde no hay dato)
  const historicalChartData = uniqueDates.map(date => historicalSalesMap[date] ?? null);
  const predictedChartData = uniqueDates.map(date => predictedSalesMap[date] ?? null);
  
  // Buscamos el índice del último valor histórico y el primer valor predicho
  let lastHistoricalIndex = -1;
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    if (historicalChartData[i] !== null) {
      lastHistoricalIndex = i;
      break;
    }
  }
  let firstPredictedIndex = -1;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (predictedChartData[i] !== null) {
      firstPredictedIndex = i;
      break;
    }
  }
  
  let connectingData = [];
  if (lastHistoricalIndex !== -1 && firstPredictedIndex !== -1) {
    const historicalDate = uniqueDates[lastHistoricalIndex];
    const predictedDate = uniqueDates[firstPredictedIndex];
    const historicalValue = historicalChartData[lastHistoricalIndex];
    const predictedValue = predictedChartData[firstPredictedIndex];
    connectingData = [
      { x: historicalDate, y: historicalValue },
      { x: predictedDate, y: predictedValue },
    ];
  }
  
  const chartData = {
    labels: uniqueDates,
    datasets: [
      {
        label: 'Ventas Históricas',
        data: historicalChartData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Ventas Predichas',
        data: predictedChartData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
      },
      // Dataset extra para la conexión
      connectingData.length > 0 && {
        label: 'Conexión',
        data: connectingData,
        borderColor: 'rgb(0, 0, 0,0.6)',
        borderWidth: 2,
        tension: 0.1,
        fill: false,
        showLine: true,
      }
    ].filter(Boolean)
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          filter: (legendItem, data) => {
            // Excluye la entrada de la leyenda que tiene el label "Conexión"
            return legendItem.text !== 'Conexión';
          }
        }
      },
      title: {
        display: true,
        text: 'Ventas Históricas y Predichas',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Ventas'
        }
      }
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">📊 Predicciones Próximas 3 Semanas</DialogTitle>
          <DialogDescription className="text-sm">
            <span className="font-semibold">📦 Item:</span> {item}
          </DialogDescription>
          <DialogDescription className="text-sm">
            <span className="font-semibold">🏢 Ciudad:</span> {ciudad}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions?.map((pred, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-md border">
              <p className="text-gray-500 text-xs">📅 {pred.fecha_referencia}</p>
              <p className="text-lg font-bold mt-2">💰 {pred.ventas_predichas.toLocaleString()} ventas</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Line data={chartData} options={options} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
