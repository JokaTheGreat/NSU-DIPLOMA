import { useState, useEffect } from "react";
import { Graphic, Sidebar, Button, Vadati as Wadati } from "./components";
import "./App.css";
import { getStationsData, parseStationsData, generatePickId } from "./utils";

export default function App() {
  const [graphicsData, setGraphicsData] = useState([]);
  const [picksData, setPicksData] = useState({});
  let stationsId = [];

  const sendPickChanges = () => {
    if (!Object.keys(picksData)?.length) {
      return;
    }

    console.log(picksData?.picks);
    console.log(picksData?.eventId);

    fetch("http://84.237.89.72:8080/update_picks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(picksData),
    }).then((response) => console.log(response.status));
  };

  const onGraphicsResize = (xaxisRangeZero, xaxisRangeOne) => {
    setGraphicsData(
      graphicsData.map((item) => {
        return {
          ...item,
          range: [xaxisRangeZero, xaxisRangeOne],
        };
      })
    );
  };

  const onChangeWave = (newTime, phase, graphicKey, network, station) => {
    setGraphicsData(
      graphicsData.map((item) => {
        if (item.key !== graphicKey) {
          return item;
        }

        return {
          ...item,
          waves: [
            ...(item.waves
              ? item.waves.filter((wave) => wave.phase !== phase)
              : []),
            {
              phase: phase,
              time: newTime,
              pickId: item?.waves.find((wave) => wave.phase === phase)
                ? item.waves.find((wave) => wave.phase === phase).pickId
                : generatePickId(phase, picksData.eventId, network, station),
              network: network,
              station: station,
            },
          ],
        };
      })
    );

    const graphicData = graphicsData.find((item) => item.key === graphicKey);
    const pickId = graphicData?.waves.find((item) => item.phase === phase)
      ? graphicData.waves.find((item) => item.phase === phase).pickId
      : generatePickId(phase, picksData.eventId, network, station);

    setPicksData({
      eventId: picksData.eventId,
      picks: [
        ...picksData.picks.filter((pick) => pick.pickId !== pickId),
        {
          time: newTime,
          pickId: pickId,
          phase: phase,
          network: network,
          station: station,
        },
      ],
    });
  };

  const setEventsData = ({ time, waves, eventId }) => {
    const HALF_MINUTE_MS = 30000;
    const SERVER_TIME_OFFSET = HALF_MINUTE_MS * 2 * 60 * 7;
    const startTime = new Date(new Date(time).getTime() - HALF_MINUTE_MS);
    const endTime = new Date(new Date(time).getTime() + HALF_MINUTE_MS);

    setGraphicsData(
      graphicsData.map((item) => {
        return {
          ...item,
          startTime: startTime,
          endTime: endTime,
          range: [startTime, endTime],
          waves: waves
            .filter(
              (wave) =>
                wave.network === item.network && wave.station === item.station
            )
            .map((wave) => {
              return {
                phase: wave.phase,
                time: new Date(wave.time),
                pickId: wave.pickId,
                network: wave.network,
                station: wave.station,
              };
            }),
        };
      })
    );

    setPicksData({
      eventId: eventId,
      picks: [],
    });
  };

  const setDefaultGraphicsData = () => {
    setGraphicsData(
      stationsId.map((item, i) => {
        return {
          key: item.network + item.station,
          ...item,
          position:
            i === 0 ? "first" : i === stationsId.length - 1 ? "last" : "",
        };
      })
    );
  };

  useEffect(async () => {
    const data = await getStationsData();
    if (!data) {
      alert("server has no stations data");
      return;
    }

    stationsId = parseStationsData(data);
    setDefaultGraphicsData();
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h2 className="app__title">Seisgraphs: </h2>
        <Button onClick={sendPickChanges} />
      </header>
      <main className="app__content">
        <Sidebar onClickCallback={setEventsData} />
        <div className="app__graphics">
          {graphicsData.map((item) => (
            <Graphic
              key={item.key}
              id={item.key}
              network={item.network}
              station={item.station}
              position={item.position}
              startTime={item.startTime}
              endTime={item.endTime}
              waves={item.waves}
              resize={onGraphicsResize}
              changeWave={onChangeWave}
              range={item.range}
            />
          ))}
        </div>
      </main>
      <Wadati
        times={graphicsData.map((item) => {
          return { startTime: item.startTime, waves: item.waves };
        })}
      />
    </div>
  );
}
