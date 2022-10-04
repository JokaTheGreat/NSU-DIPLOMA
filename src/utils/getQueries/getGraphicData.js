import properties from "../../properties";

export async function getGraphicData(network, station, channel, startTime, endTime) {
    const url =
        properties.SERVER +
        `dataselect/1/query?` +
        `network=${network}&station=${station}&channel=${channel}` +
        `&starttime=${startTime.toISOString()}&endtime=${endTime.toISOString()}`;

    const response = await fetch(url);
    const data = await response.arrayBuffer();

    return data;
}