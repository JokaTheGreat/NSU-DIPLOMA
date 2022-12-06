function isObjectEmpty(obj) {
  for (let _ in obj) {
    return false;
  }

  return true;
}

function pickIdWithoutStation(pickId) {
  return pickId.slice(0, pickId.lastIndexOf("/") + 1);
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

    const waves = [...event.getElementsByTagName("pick")]
      .map((pick) => {
        const phase = pick.children[0].textContent;
        const time = pick.children[3].children[0].textContent;
        const waveFormId = pick.children[4];

        if (waveFormId.getAttribute("channelCode") !== "HHE") {
          return {};
        }

        //Мб убрать network and station?
        return {
          pickId: pickIdWithoutStation(pick.getAttribute("publicID")),
          phase: phase,
          time: time,
          network: waveFormId.getAttribute("networkCode"),
          station: waveFormId.getAttribute("stationCode"),
        };
      })
      .filter((item) => !isObjectEmpty(item));

    eventsInfo.push({
      eventId: event.getAttribute("publicID"),
      magnitude: magnitudes[i],
      time: time,
      waves: waves,
    });
  }

  return eventsInfo;
}
