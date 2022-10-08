import { useState, useEffect } from "react";
import { Graphic, Sidebar, Button, Vadati } from "./components";
import "./App.css";
import { getStationsData, parseStationsData } from "./utils";

export default function App() {
  const [graphicsData, setGraphicsData] = useState([]);
  let stationsId = [];

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
  };

  const setEventGraphicsData = ({ time, waves }) => {
    const MINUTE_MS = 60000;
    const SERVER_TIME_OFFSET = MINUTE_MS * 60 * 7;
    const startTime = new Date(new Date(time).getTime() - SERVER_TIME_OFFSET);
    const endTime = new Date(startTime.getTime() + MINUTE_MS);

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
                wave.station === item.station &&
                wave.channel === item.channel
            )
            .map((wave) => {
              return { phase: wave.phase, time: new Date(new Date(wave.time).getTime() - SERVER_TIME_OFFSET) };
            }),
        };
      })
    );
  };

  const setDefaultGraphicsData = () => {
    setGraphicsData(
      stationsId.map((item, i) => {
        return {
          key: item.network + item.station + item.channel,
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
        <Button />
      </header>
      <main className="app__content">
        <Sidebar onClickCallback={setEventGraphicsData} />
        <div className="app__graphics">
          {graphicsData.map(item =>
            <Graphic
              key={item.key}
              id={item.key}
              network={item.network}
              station={item.station}
              channel={item.channel}
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
      <Vadati
        times={graphicsData.map((item) => {
          return { startTime: item.startTime, waves: item.waves };
        })}
      />
    </div>
  );
}
