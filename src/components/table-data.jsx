import { getDates, isBigCity, isSeason,sendPredictionData } from "@/api/predictionApi";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

// Función para eliminar outliers con Winsorizing
const winsorize = (arr, limit = 0.05) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.floor(limit * sorted.length);
  const minVal = sorted[index];
  const maxVal = sorted[sorted.length - 1 - index];

  return arr.map((x) => Math.min(Math.max(x, minVal), maxVal));
};

// Función para calcular la media móvil
const rollingMean = (arr, windowSize = 4) => {
  return arr.map((_, i) => {
    const slice = arr.slice(Math.max(0, i - windowSize + 1), i + 1);
    return slice.reduce((sum, val) => sum + val, 0) / slice.length;
  });
};

export default function TableData({ data }) {
  const [dataApi, setDataApi] = useState({ ciudad: "", ultimas_semanas: [] });

  useEffect(() => {
    if (data && data.date) {
      console.log("Datos recibidos:", data);

      const bigCity = isBigCity(data.city);
      const datesArray = getDates(data.date);

      // Generar valores de ventas aleatorios entre 10,000 y 50,000
      const sales = Array.from({ length: datesArray.length }, () =>
        Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000
      );
      
      // Aplicar winsorizing a los valores de ventas
      const cleanSales = winsorize(sales);

      // Aplicar logaritmo (usando Math.log(x + 1))
      const salesLog = cleanSales.map((qty) => Math.log(qty + 1));

      // Calcular la tendencia (media móvil con ventana de 4)
      const salesTrend = rollingMean(cleanSales);

      const newEntries = datesArray.map((date, index) => {
        const isInSeason = isSeason(date);

        return {
          fecha: date,
          is_big_city: bigCity,
          season: isInSeason,
          sales: sales[index],
          qty_trend: salesTrend[index],
        };
      });

      // Ordenar las entradas por fecha
      newEntries.sort((a, b) => a.fecha - b.fecha);

      // Formatear la fecha para mostrarla en dd/mm/aaaa
      const formattedEntries = newEntries.map((entry) => ({
        ...entry,
        fecha: new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(entry.fecha),
      }));

      setDataApi({ ciudad: data.city, ultimas_semanas: formattedEntries });
    }
  }, [data]);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Big City</th>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Trend</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dataApi.ultimas_semanas.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.fecha}</td>
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.is_big_city ? "Sí" : "No"}</td>
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.season ? "Sí" : "No"}</td>
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.sales}</td>
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty_trend.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-4 bg-gray-600 hover:bg-gray-700" onClick={() => sendPredictionData(dataApi)}>
          Make Prediction
      </Button>
    </div>
  );
}
