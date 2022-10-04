function parseTime(time) {
    const timeArray = time.match(/\d{2}/g);

    return `${timeArray[3]}.${timeArray[2]}.${timeArray[1]} ${timeArray[4]}:${timeArray[5]}`;
}

export function parseEventData(data) {
    const eventsInfo = [];
    const xml = new DOMParser().parseFromString(data, "text/xml");

    const magnitudes = [...xml.getElementsByTagName("mag")].map(
        (mag) => mag.textContent
    );
    const origins = [...xml.getElementsByTagName("origin")];
    const events = [...xml.getElementsByTagName("event")];

    for (const [i, event] of events.entries()) {
        const time = [...origins[i].getElementsByTagName("time")].map(
            (tm) => tm.children[0].textContent
        )[0];

        const waves = [...event.getElementsByTagName("pick")].map((pick) => {
            const phase = pick.children[0].textContent;
            const time = pick.children[3].children[0].textContent;
            const waveFormId = pick.children[4];

            return {
                phase: phase,
                time: time,
                network: waveFormId.getAttribute("networkCode"),
                station: waveFormId.getAttribute("stationCode"),
                location: waveFormId.getAttribute("locationCode"),
                channel: waveFormId.getAttribute("channelCode"),
            };
        });

        eventsInfo.push({
            magnitude: magnitudes[i],
            time: parseTime(time),
            waves: waves,
        });
    }

    return eventsInfo;
}