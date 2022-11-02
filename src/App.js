import { useState, useEffect } from "react";
import { Graphic, Sidebar, Button, Vadati as Wadati } from "./components";
import "./App.css";
import { getStationsData, parseStationsData } from "./utils";

export default function App() {
  const [graphicsData, setGraphicsData] = useState([]);
  const [picksData, setPicksData] = useState({});
  let stationsId = [];

  const sendPickChanges = () => {
    if (!Object.keys(picksData)?.length) {
      return;
    }

    const query = `query?eventId=${picksData?.eventId}&picks=[` +
      picksData?.picks.map((item, i) => `pickId=${item.pickId}&time=${item.time}` + (i !== picksData.picks.length - 1 ? "," : "")) +
      ']';

    alert(query);
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

  const onChangeWave = (newTime, phase, graphicKey) => {
    setGraphicsData(
      graphicsData.map(item => {
        if (item.key !== graphicKey) {
          return item;
        }

        return {
          ...item,
          waves: [
            ...item.waves.filter(wave => wave.phase !== phase),
            { phase: phase, time: newTime }
          ],
        };
      })
    );

    setPicksData({
      ...picksData,
      picks: picksData.picks.map((item, i) => {
        if (graphicsData[i].key !== graphicKey) {
          return item;
        }

        return {
          ...item,
          time: newTime,
        };
      }),
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
                wave.network === item.network &&
                wave.station === item.station
            )
            .map((wave) => {
              return { phase: wave.phase, time: new Date(new Date(wave.time).getTime()) };
            }),
        };
      })
    );

    setPicksData(
      {
        eventId: eventId,
        picks: waves.map(item => {
          return { pickId: item.pickId, time: item.time };
        })
      }
    );
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
          {graphicsData.map(item =>
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
          )}
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
