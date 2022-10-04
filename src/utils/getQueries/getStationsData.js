import properties from "../../properties";

export async function getStationsData() {
    const url = properties.SERVER + "station/1/query?level=channel";

    const response = await fetch(url);
    const data = await response.text();

    return data;
}