import Plot from "react-plotly.js";
import * as seisplotjs from "seisplotjs";
import { useState, useEffect } from "react";
import "./Graphic.css";
import properties from "../../properties";

async function getGraphicData(network, station, channel, startTime, endTime) {
  const url =
    properties.SERVER +
    `dataselect/1/query?` +
    `network=${network}&station=${station}&channel=${channel}` +
    `&starttime=${startTime.toISOString()}&endtime=${endTime.toISOString()}`;

  const response = await fetch(url);
  const data = await response.arrayBuffer();

  return data;
}

function parseGraphicData(data, startTime, endTime) {
  const dataRecords = seisplotjs.miniseed.parseDataRecords(data);
  const seismogram = seisplotjs.miniseed.merge(dataRecords);

  const x = [];
  const y = seismogram._segmentArray[0].y;
  const step = (endTime - startTime) / y.length;

  y.forEach((item, i) => {
    x.push(new Date(Math.round(startTime.getTime() + step * i)));
  });

  return { x, y };
}

export function Graphic(props) {
  const [data, setData] = useState([]);

  const defaultLineShape = {
    line: { color: "white" },
    yref: "paper",
    y0: 0,
    y1: 1,
    opacity: 1,
  };

  const defaultSquareShape = {
    fillcolor: "white",
    line: { color: "white" },
    yref: "paper",
    xsizemode: "pixel",
    y0: 0.8,
    y1: 1,
    x0: 0,
    x1: 15,
    opacity: 1,
  };

  const defaultAnnotation = {
    xanchor: "left",
    yref: 'paper',
    y: 1.02,
    showarrow: false,
    font: { size: 16, color: "#282c34" }
  };

  const defaultLayout = {
    margin: {
      t: props.position !== "first" ? 1 : 30,
      r: 1,
      b: props.position !== "last" ? 1 : 20,
      l: 40,
    },
    font: {
      color: "#61dafb",
    },
    paper_bgcolor: "#282c34",
    plot_bgcolor: "#282c34",
    yaxis: {
      fixedrange: true,
      linecolor: "#61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
    },
    xaxis: {
      linecolor: "61dafb",
      linewidth: 1,
      mirror: true,
      gridcolor: "#61dafb44",
      showticklabels: props.position === "" ? false : true,
      side: props.position !== "first" ? "bottom" : "top",
    },
  };

  const [layout, setLayout] = useState(defaultLayout);

  const classname =
    props.position === ""
      ? "graphic__wrapper"
      : "graphic__wrapper_" + props.position;

  useEffect(async () => {
    if (!props.startTime || !props.endTime) {
      return;
    }

    const seisData = await getGraphicData(
      props.network,
      props.station,
      props.channel,
      props.startTime,
      props.endTime
    );

    if (!seisData.byteLength) {
      setData([]);
      return;
    }

    const { x, y } = parseGraphicData(seisData, props.startTime, props.endTime);

    setData([
      {
        x: x,
        y: y,
        type: "scatter",
        mode: "lines",
        hoverinfo: "none",
        marker: {
          color: "#61dafb",
        },
      },
    ]);
  }, [props.startTime, props.endTime]);

  useEffect(() => {
    if (!props.waves) {
      return;
    }

    setLayout({
      ...layout,
      shapes: [
        ...props.waves.map((wave) => {
          return {
            ...defaultSquareShape,
            xanchor: wave.time,
          };
        }),
        ...props.waves.map((wave) => {
          return {
            ...defaultLineShape,
            x0: wave.time,
            x1: wave.time,
          };
        }),
      ],
      annotations: [
        ...props.waves.map((wave) => {
          return {
            ...defaultAnnotation,
            x: wave.time,
            text: wave.phase,
          };
        })
      ]
    });
  }, [props.waves]);

  const setRange = (newRange, autorange) => {
    setLayout({
      ...layout,
      xaxis: { ...layout.xaxis, autorange: autorange, range: newRange },
    });
  };

  useEffect(() => {
    if (props.range) {
      if (props.range[0] === props.startTime.toISOString()) {
        setRange(props.range, true);
        return;
      }
      setRange(props.range, false);
    }
  }, [props.range]);

  const changeWave = (newTime, wavePhase) => {
    const waveIndex = layout.annotations.findIndex((item) => item.text === wavePhase);
    const layoutNewShapes = [];
    const layoutNewAnnotations = [];

    if (waveIndex === -1) {
      layoutNewShapes.push(
        {
          ...defaultSquareShape,
          xanchor: newTime,
        },
        {
          ...defaultLineShape,
          x0: newTime,
          x1: newTime,
        }
      );

      layout.shapes.forEach((shape) => layoutNewShapes.push(shape));

      layoutNewAnnotations.push({
        ...defaultAnnotation,
        x: newTime,
        text: wavePhase,
      });

      layout.annotations.forEach((annotation) => layoutNewAnnotations.push(annotation));
    }
    else {
      layout.shapes.forEach((shape, i) => {
        if (i % (layout.shapes.length / 2) === waveIndex) {
          if (shape?.xanchor) {
            layoutNewShapes.push({
              ...shape,
              xanchor: newTime,
            });
          }
          else {
            layoutNewShapes.push({
              ...shape,
              x0: newTime,
              x1: newTime
            });
          }
        }
        else {
          layoutNewShapes.push(shape);
        }
      });

      layout.annotations.forEach((annotation) => {
        if (annotation.text === wavePhase) {
          layoutNewAnnotations.push({
            ...annotation,
            x: newTime,
          })
        }
        else {
          layoutNewAnnotations.push(annotation);
        }
      });
    }

    setLayout({
      ...layout,
      shapes: layoutNewShapes,
      annotations: layoutNewAnnotations
    });
  };

  return (
    <Plot
      onClick={(e) => {
        if (e.event.shiftKey) {
          if (e.event.button === 0) {
            changeWave(new Date(e.points[0].x), "P");
          }
          if (e.event.button === 1) {
            props.resize(
              props.startTime.toISOString(),
              props.endTime.toISOString()
            );
          }
          if (e.event.button === 2) {
            changeWave(new Date(e.points[0].x), "S");
          }
        }
      }}
      onRelayout={(e) => {
        props.resize(e["xaxis.range[0]"], e["xaxis.range[1]"]);
      }}
      className={classname}
      data={data}
      layout={layout}
      config={{
        modeBarButtonsToRemove: [
          "toImage",
          "zoom2d",
          "pan2d",
          "zoomIn2d",
          "zoomOut2d",
          "autoScale2d",
        ],
        displaylogo: false,
        doubleClick: false, //не работает
        scrollZoom: true,
      }}
    />
  );
}
