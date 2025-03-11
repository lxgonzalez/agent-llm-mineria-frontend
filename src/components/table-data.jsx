import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import PredictionModal from "./prediction-modal";
import { getDates, isBigCity, isSeason, sendPredictionData, winsorize, rollingMean, generateQty } from "@/api/predictionApi";

export default function TableData({ data }) {
  const [dataApi, setDataApi] = useState({ ciudad: "",item:"", fecha_inicio: "", fecha_fin: "", ultimas_semanas: [] });
  const [predictions, setPredictions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data && data.date) {
      console.log("Datos recibidos:", data);
  
      const bigCity = isBigCity(data.city);
      const datesArray = getDates(data.date);
  
      // Generar valores de ventas aleatorios entre 10,000 y 50,000
      const sales = Array.from({ length: datesArray.length }, () =>
        generateQty(data.city, data.item)
      );
      console.log(sales);
      
  
      const cleanSales = winsorize(sales);
      const salesTrend = rollingMean(cleanSales);
  
      const newEntries = datesArray.map((date, index) => ({
        fecha: date,
        is_big_city: bigCity,
        season: isSeason(date),
        sales: sales[index],
        qty_trend: salesTrend[index],
      }));
  
      // Ordenar las entradas por fecha
      // newEntries.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  
      // Formatear la fecha en YYYY-MM-DD
      const formattedEntries = newEntries.map((entry) => ({
        ...entry,
        fecha: new Date(entry.fecha).toISOString().split("T")[0],
      }));

      const fechaInicio = new Date(formattedEntries[formattedEntries.length - 1].fecha);
      fechaInicio.setDate(fechaInicio.getDate() + 7);
      const fechaInicioFormatted = fechaInicio.toISOString().split("T")[0];
        
      const fechaFin = new Date(formattedEntries[formattedEntries.length - 1].fecha);
      fechaFin.setDate(fechaFin.getDate() + 21);
      const fechaFinFormatted = fechaFin.toISOString().split("T")[0];

      setDataApi({
        ciudad: data.city,
        item: data.item,
        fecha_inicio: fechaInicioFormatted, 
        fecha_fin: fechaFinFormatted,
        ultimas_semanas: formattedEntries,
      });
    }
  }, [data]);

  // Función para actualizar el valor de sales (Qty) y recalcular la tendencia
  const handleSalesChange = (index, newSalesValue) => {
    const newSales = Number(newSalesValue);
    // Actualiza el valor de sales en la entrada correspondiente
    const updatedEntries = dataApi.ultimas_semanas.map((entry, i) => {
      if (i === index) {
        return { ...entry, sales: newSales };
      }
      return entry;
    });
    // Extrae el array de ventas y aplica winsorize
    const salesArray = updatedEntries.map(entry => entry.sales);
    console.log(salesArray);

    const cleanSales = winsorize(salesArray);
    // Recalcula la tendencia usando los valores winsorizados
    const updatedTrend = rollingMean(cleanSales);
    // Actualiza cada entrada con la nueva tendencia
    const finalEntries = updatedEntries.map((entry, i) => ({
      ...entry,
      qty_trend: updatedTrend[i],
    }));
  
    setDataApi({ ...dataApi, ultimas_semanas: finalEntries });
  };
  

  // Manejar el envío de datos y abrir el modal
  const handlePrediction = async () => {
    try {
      const response = await sendPredictionData(dataApi);
      setPredictions(response.predicciones_semanales || []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener predicciones:", error);
    }
  };

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
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                {/* Input editable para Qty */}
                <input
                  type="number"
                  value={item.sales}
                  onChange={(e) => handleSalesChange(index, e.target.value)}
                  className="border rounded p-1 w-full"
                />
              </td>
              <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty_trend.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-4 bg-gray-600 hover:bg-gray-700" onClick={handlePrediction}>
        Make Prediction
      </Button>

      {/* Modal de predicción */}
      <PredictionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        predictions={predictions}
        historicalData={dataApi.ultimas_semanas}
        item={dataApi.item}
        ciudad={dataApi.ciudad}
      />
    </div>
  );
}
