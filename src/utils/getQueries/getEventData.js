import properties from "../../properties";

export async function getEventData() {
    const url = properties.SERVER + "event/1/query?limit=10&includearrivals=true";

    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.text();
    //return data;
    return properties.eventsString;
}