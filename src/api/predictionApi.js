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

    return dates.reverse(); // Invierte el array para obtenerlo en orden ascendente
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
        const response = await fetch("http://3.233.19.147:8000/predict", {
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
        item: data.item,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        ultimas_semanas: data.ultimas_semanas.map(({ fecha, ...rest }) => rest)
    };
}

export function generateQty(city, item) {
    const qtyRanges = new Map([
        // AMBATO
        ['AMBATO_AGUA VIVANT 6 LITROS X 4', { min: 200, max: 500 }],
        ['AMBATO_AGUA VIVANT 600 16+4', { min: 800, max: 1500 }],
        ['AMBATO_VIVANT AGUA 1 LITRO', { min: 710, max: 1210 }],
        ['AMBATO_VIVANT ST LIMONADA 450CC X 40', { min: 260, max: 460 }],
        ['AMBATO_VIVANT ST MANZANA 450CC X 40', { min: 115, max: 515 }],
        ['AMBATO_VIVANT ST MORA 450CC X 40', { min: 286, max: 586 }],
        ['AMBATO_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 109, max: 409 }],
        ['AMBATO_ZHUMIR DURAZNO GR 700CCX12 NG', { min: 667, max: 1667 }],
        ['AMBATO_ZHUMIR SECO EXTRA 350CCX24 N', { min: 59, max: 609 }],
        ['AMBATO_ZHUMIR SECO EXTRA 700CCX12 N', { min: 47, max: 870 }],

        // AZOGUES
        ['AZOGUES_AGUA VIVANT 600 16+4', { min: 5602, max: 82244 }],
        ['AZOGUES_NICETEA 1250CC X6', { min: 21, max: 404 }],
        ['AZOGUES_NICETEA 450CCX24', { min: 60, max: 1194 }],
        ['AZOGUES_VIVANT ST MORA 450CC X 40', { min: 363, max: 10075 }],
        ['AZOGUES_WHISKY CUNINGHAM 750CCX6', { min: 6, max: 395 }],
        ['AZOGUES_ZHUMIR AGUAR PA SUAVE 350CCX24', { min: 55, max: 2406 }],
        ['AZOGUES_ZHUMIR AGUAR PA SUAVE 700CCX12', { min: 16, max: 1130 }],
        ['AZOGUES_ZHUMIR AGUARDIENTE 125CCX12', { min: 2, max: 8724 }],
        ['AZOGUES_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 5, max: 285 }],
        ['AZOGUES_ZHUMIR DURAZNO GR 700CCX12 NG', { min: 6, max: 524 }],
        ['AZOGUES_ZHUMIR PINA COLADA 700CCX12', { min: 2, max: 288 }],
        ['AZOGUES_ZHUMIR SECO SUAVE 350CCX24 NG', { min: 27, max: 1731 }],

        // CUENCA
        ['CUENCA_AGUA VIVANT 600 16+4', { min: 8, max: 94078 }],
        ['CUENCA_CUNINGHAM 375', { min: 4, max: 425 }],
        ['CUENCA_NICETEA 1250CC X6', { min: 6, max: 453 }],
        ['CUENCA_NICETEA 450CCX24', { min: 77, max: 9748 }],
        ['CUENCA_RON RONERO 375CCX24', { min: 2, max: 1060 }],
        ['CUENCA_RON RONERO 750CCX12', { min: 23, max: 931 }],
        ['CUENCA_SWITCH BONGO 350CCX12 NG', { min: 4, max: 1792 }],
        ['CUENCA_SWITCH MARACUYA 350CCX12 NG', { min: 2, max: 2199 }],
        ['CUENCA_VIVANT LIPOTERMICA 500X40', { min: 6, max: 2465 }],
        ['CUENCA_VIVANT ST MORA 450CC X 40', { min: 439, max: 15601 }],
        ['CUENCA_WHISKY CUNINGHAM 750CCX6', { min: 29, max: 1273 }],
        ['CUENCA_ZH CANUTO CANA SELECTA 700CCX6', { min: 5, max: 232 }],
        ['CUENCA_ZHUMIR AGUAR PA 350CCX24 RT', { min: 480, max: 14985 }],
        ['CUENCA_ZHUMIR AGUAR PA SUAVE 700CCX12', { min: 26, max: 1868 }],
        ['CUENCA_ZHUMIR AGUARDIENTE 125CCX12', { min: 4, max: 10112 }],
        ['CUENCA_ZHUMIR AGUARDIENTE 1500CCX6', { min: 13, max: 1280 }],
        ['CUENCA_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 6, max: 964 }],
        ['CUENCA_ZHUMIR PINA COLADA 700CCX12', { min: 3, max: 1038 }],
        ['CUENCA_ZHUMIR SECO SUAVE 350CCX24 NG', { min: 6, max: 2153 }],
        ['CUENCA_ZHUMIR SECO SUAVE 700CCX12 NG', { min: 7, max: 830 }],

        // GUAYAQUIL
        ['GUAYAQUIL_AGUA VIVANT 6 LITROS X 4', { min: 170, max: 7333 }],
        ['GUAYAQUIL_AGUA VIVANT 600 16+4', { min: 10, max: 89361 }],
        ['GUAYAQUIL_NICETEA 1250CC X6', { min: 109, max: 2714 }],
        ['GUAYAQUIL_NICETEA 450CCX24', { min: 87, max: 3735 }],
        ['GUAYAQUIL_SWITCH BONGO 350CCX12 NG', { min: 10, max: 543 }],
        ['GUAYAQUIL_SWITCH MARACUYA 350CCX12 NG', { min: 18, max: 939 }],
        ['GUAYAQUIL_SWITCH MARACUYA X6 NG', { min: 3, max: 17678 }],
        ['GUAYAQUIL_VIVANT LIPOTERMICA 500X40', { min: 6, max: 872 }],
        ['GUAYAQUIL_VIVANT ST LIMONADA 450CC X 40', { min: 10, max: 4257 }],
        ['GUAYAQUIL_VIVANT ST MANZANA 450CC X 40', { min: 20, max: 1147 }],
        ['GUAYAQUIL_VIVANT ST MORA 450CC X 40', { min: 13, max: 3329 }],
        ['GUAYAQUIL_ZHUMIR AGUAR PA SUAVE 350CCX24', { min: 2, max: 131 }],
        ['GUAYAQUIL_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 5, max: 999 }],
        ['GUAYAQUIL_ZHUMIR PINK 700CCX12', { min: 2, max: 1183 }],

        // IBARRA
        ['IBARRA_SWITCH BONGO 350CCX12 NG', { min: 60, max: 1197 }],
        ['IBARRA_WHISKY CUNINGHAM 750CCX6', { min: 1, max: 323 }],
        ['IBARRA_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 2, max: 258 }],

        // LOJA
        ['LOJA_AGUA VIVANT 600 16+4', { min: 280, max: 68773 }],
        ['LOJA_VIVANT ST LIMONADA 450CC X 40', { min: 6, max: 1529 }],
        ['LOJA_VIVANT ST MANZANA 450CC X 40', { min: 33, max: 1344 }],
        ['LOJA_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 45, max: 1660 }],
        ['LOJA_ZHUMIR SECO SUAVE 350CCX24 NG', { min: 89, max: 1073 }],
        ['LOJA_ZHUMIR SECO SUAVE 700CCX12 NG', { min: 21, max: 550 }],

        // MACHALA
        ['MACHALA_AGUA VIVANT 6 LITROS X 4', { min: 1, max: 1591 }],
        ['MACHALA_AGUA VIVANT 600 16+4', { min: 573, max: 153199 }],
        ['MACHALA_SWITCH BONGO BONGO X6 NG', { min: 3, max: 2348 }],
        ['MACHALA_VIVANT AGUA 1 LITRO', { min: 3, max: 6936 }],
        ['MACHALA_VIVANT ST LIMONADA 450CC X 40', { min: 10, max: 1972 }],
        ['MACHALA_VIVANT ST MANZANA 450CC X 40', { min: 6, max: 964 }],
        ['MACHALA_ZHUMIR SECO SUAVE 350CCX24 NG', { min: 3, max: 777 }],
        ['MACHALA_ZHUMIR SECO SUAVE 700CCX12 NG', { min: 6, max: 327 }],

        // MANTA
        ['MANTA_AGUA VIVANT 600 16+4', { min: 1080, max: 40000 }],

        // MILAGRO
        ['MILAGRO_AGUA VIVANT 6 LITROS X 4', { min: 9, max: 392 }],
        ['MILAGRO_AGUA VIVANT 600 16+4', { min: 242, max: 54502 }],
        ['MILAGRO_NICETEA 450CCX24', { min: 12, max: 667 }],
        ['MILAGRO_VIVANT ST LIMONADA 450CC X 40', { min: 10, max: 797 }],
        ['MILAGRO_VIVANT ST MANZANA 450CC X 40', { min: 3, max: 316 }],
        ['MILAGRO_VIVANT ST MORA 450CC X 40', { min: 10, max: 1050 }],
        ['MILAGRO_ZHUMIR SECO EXTRA 350CCX24 N#', { min: 12, max: 1652 }],
        ['MILAGRO_ZHUMIR SECO EXTRA 700CCX12 N#', { min: 5, max: 3088 }],
         

        // PENINSULA DE SANTA ELENA
        ['PENINSULA DE SANTA ELENA_AGUA VIVANT 6 LITROS X 4', { min: 112, max: 1582 }],
        ['PENINSULA DE SANTA ELENA_NICETEA 1250CC X6', { min: 12, max: 543 }],
        ['PENINSULA DE SANTA ELENA_NICETEA 450CCX24', { min: 36, max: 696 }],
        ['PENINSULA DE SANTA ELENA_SWITCH BONGO 350CCX12 NG', { min: 1, max: 286 }],
        ['PENINSULA DE SANTA ELENA_SWITCH MARACUYA 350CCX12 NG', { min: 1, max: 412 }],
        ['PENINSULA DE SANTA ELENA_VENETTO SANDIA 1500CCX6', { min: 2, max: 696 }],
        ['PENINSULA DE SANTA ELENA_VIVANT ST LIMONADA 450CC X 40', { min: 50, max: 979 }],
        ['PENINSULA DE SANTA ELENA_VIVANT ST MANZANA 450CC X 40', { min: 20, max: 525 }],
        ['PENINSULA DE SANTA ELENA_VIVANT ST MORA 450CC X 40', { min: 32, max: 899 }],
        ['PENINSULA DE SANTA ELENA_ZHUMIR SECO EXTRA 350CCX24 N#', { min: 27, max: 499 }],
        ['PENINSULA DE SANTA ELENA_ZHUMIR SECO EXTRA 700CCX12 N#', { min: 5, max: 2557 }],
         
        // PUYO
        ['PUYO_AGUA VIVANT 600 16+4', { min: 1440, max: 30705 }],

        // QUEVEDO
        ['QUEVEDO_AGUA VIVANT 6 LITROS X 4', { min: 124, max: 1561 }],
        ['QUEVEDO_AGUA VIVANT 600 16+4', { min: 416, max: 69937 }],
        ['QUEVEDO_NICETEA 1250CC X6', { min: 40, max: 409 }],
        ['QUEVEDO_NICETEA 450CCX24', { min: 96, max: 892 }],
        ['QUEVEDO_SWITCH MARACUYA X6 NG', { min: 1, max: 3637 }],
        ['QUEVEDO_VIVANT ST LIMONADA 450CC X 40', { min: 30, max: 1110 }],
        ['QUEVEDO_WHISKY CUNINGHAM 750CCX6', { min: 1, max: 429 }],

        // QUITO
        ['QUITO_AGUA VIVANT 6 LITROS X 4', { min: 182, max: 33010 }],
        ['QUITO_AGUA VIVANT 600 16+4', { min: 287, max: 48739 }],
        ['QUITO_NICETEA 1250CC X6', { min: 87, max: 4916 }],
        ['QUITO_NICETEA 450CCX24', { min: 79, max: 9934 }],
        ['QUITO_SWITCH BONGO 350CCX12 NG', { min: 54, max: 2990 }],
        ['QUITO_WHISKY CUNINGHAM 750CCX6', { min: 51, max: 8362 }],
        ['QUITO_ZHUMIR AGUARDIENTE 125CCX12', { min: 1, max: 148 }],
        ['QUITO_ZHUMIR DURAZNO GR 700CCX12 NG', { min: 486, max: 10739 }],
        ['QUITO_ZHUMIR PINK 700CCX12', { min: 12, max: 2247 }],
        ['QUITO_ZHUMIR SECO EXTRA 700CCX12 N', { min: 12, max: 1866 }],

        // RIOBAMBA
        ['RIOBAMBA_AGUA VIVANT 6 LITROS X 4', { min: 12, max: 942 }],
        ['RIOBAMBA_NICETEA 1250CC X6', { min: 81, max: 554 }],
        ['RIOBAMBA_NICETEA 450CCX24', { min: 51, max: 1102 }],
        ['RIOBAMBA_SWITCH BONGO 350CCX12 NG', { min: 16, max: 1305 }],
        ['RIOBAMBA_VIVANT ST LIMONADA 450CC X 40', { min: 7, max: 892 }],
        ['RIOBAMBA_ZHUMIR DURAZNO CAM 350CCX24 NG', { min: 20, max: 778 }],
        ['RIOBAMBA_ZHUMIR DURAZNO GR 700CCX12 NG', { min: 56, max: 1760 }],
        ['RIOBAMBA_ZHUMIR SECO EXTRA 350CCX24 N', { min: 34, max: 681 }],
        ['RIOBAMBA_ZHUMIR SECO EXTRA 700CCX12 N', { min: 29, max: 838 }],

        // STO. DOMINGO
        ['STO. DOMINGO_NICETEA 1250CC X6', { min: 12, max: 547 }],
        ['STO. DOMINGO_SWITCH BONGO 350CCX12 NG', { min: 5, max: 275 }],
        ['STO. DOMINGO_SWITCH MARACUYA 350CCX12 NG', { min: 13, max: 405 }],
        ['STO. DOMINGO_VENETTO SANDIA 1500CCX6', { min: 26, max: 1634 }],
        ['STO. DOMINGO_VIVANT LIPOTERMICA 500X40', { min: 10, max: 344 }]
    ]);

    const key = `${city}_${item}`;
    const range = qtyRanges.get(key) || { min: 0, max: 0 };
    return Math.floor(Math.random() * (range.min - range.max + 1)) + range.max;
}