import { big_cities, season } from '@/data/cities.json'

export function getDates(date) {
    const dates = [];

    const baseDate = new Date(date);
    baseDate.setDate(baseDate.getDate());

    for (let i = 7; i <= 117; i += 7) {
        const newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() - i);
        dates.push(newDate);
    }
    return dates;
}

export function isBigCity(city) {
    return big_cities.includes(city) ? 1 : 0;
}

export function isSeason(date) {
    const month = date.getMonth() + 1;
    return season.includes(month) ? 1 : 0;
}

export function winsorize(arr, limit = 0.05) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.floor(limit * sorted.length);
    const minVal = sorted[index];
    const maxVal = sorted[sorted.length - 1 - index];

    return arr.map((x) => Math.min(Math.max(x, minVal), maxVal));
};

export function rollingMean(arr, windowSize = 4) {
    return arr.map((_, i) => {
        const slice = arr.slice(Math.max(0, i - windowSize + 1), i + 1);
        return slice.reduce((sum, val) => sum + val, 0) / slice.length;
    });
};

export async function sendPredictionData(data) {
    const dataApi = cleanData(data);
    console.log(dataApi);

    try {
        const response = await fetch("http://3.233.19.147:8000/predict_custom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Error al enviar los datos a la API");
        }

        const jsonResponse = await response.json();
        console.log(jsonResponse);

        return jsonResponse;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}


export function cleanData(data) {
    return {
        ciudad: data.ciudad,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        ultimas_semanas: data.ultimas_semanas.map(({ fecha, ...rest }) => rest)
    };
}
