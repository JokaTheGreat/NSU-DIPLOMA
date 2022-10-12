export function parseStationsData(data) {
    const stationsData = [];

    const xml = new DOMParser().parseFromString(data, "text/xml");
    const networks = xml.getElementsByTagName("Network");

    for (let network of networks) {
        if (network.nodeName !== "Network") {
            continue;
        }

        const networkCode = network.getAttribute("code");
        if (networkCode !== "KA") {
            continue;
        }

        const stations = network.children;

        for (let station of stations) {
            if (station.nodeName !== "Station") {
                continue;
            }

            const stationCode = station.getAttribute("code");

            stationsData.push({
                network: networkCode,
                station: stationCode,
            });
        }
    }

    return stationsData;
}