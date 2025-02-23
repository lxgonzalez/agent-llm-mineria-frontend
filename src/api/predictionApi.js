import { big_cities, season } from '@/data/cities.json'

export function getDates(date) {
    const dates = [];

    // Se suma un día a la fecha que llega
    const baseDate = new Date(date);
    baseDate.setDate(baseDate.getDate() + 1);

    for (let i = 0; i <= 110; i += 7) {
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

export async function sendPredictionData(data) {
    const dataApi = cleanData(data);
    console.log(dataApi);

    try {
        const response = await fetch("https://api.example.com/prediction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Error al enviar los datos a la API");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export function cleanData(data) {
    return {
        ciudad: data.ciudad,
        ultimas_semanas: data.ultimas_semanas.map(({ fecha, ...rest }) => rest)
    };
}
