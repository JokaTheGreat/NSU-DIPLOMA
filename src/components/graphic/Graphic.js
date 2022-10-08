import { useState, useEffect } from "react";
import "./Graphic.css";
import Plot from "react-plotly.js";
import { getGraphicData, parseGraphicData } from "../../utils";

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
      autorange: false,
    },
  };

  const [layout, setLayout] = useState(defaultLayout);

  const classname =
    props.position === ""
      ? "graphic__wrapper"
      : "graphic__wrapper_" + props.position;

  const setNewData = async () => {
    if (!props.startTime || !props.endTime || !props.network || !props.station || !props.channel) {
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
      alert("server has no seis data");
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
  };

  useEffect(() => {
    setNewData();
  }, [props.startTime, props.endTime, props.channel, props.station, props.network]);

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

  const setRange = (newRange) => {
    setLayout({
      ...layout,
      xaxis: { ...layout.xaxis, range: newRange },
    });
  };

  useEffect(() => {
    if (!props.range) {
      return;
    }

    setRange(props.range);
  }, [props.range]);

  return (
    <Plot
      onClick={(e) => {
        if (e.event.shiftKey && e.event.button === 0) {
          props.changeWave(new Date(e.points[0].x), "P", props.id);
        }

        if (e.event.ctrlKey && e.event.button === 0) {
          props.changeWave(new Date(e.points[0].x), "S", props.id);
        }
      }}
      onRelayout={(e) => {
        const zeroPoint = e["xaxis.range[0]"];
        const firstPoint = e["xaxis.range[1]"];

        if (!zeroPoint || !firstPoint) {
          return;
        }

        if (typeof zeroPoint === 'number' && isFinite(zeroPoint)) {
          props.resize(zeroPoint, firstPoint);
          return;
        }

        props.resize(new Date(zeroPoint), new Date(firstPoint));
      }}
      onDoubleClick={() => {
        if (!props.startTime || !props.endTime) {
          props.resize(-1, 6);
          return;
        }

        props.resize(props.startTime, props.endTime);
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
        doubleClick: false,
        scrollZoom: true,
      }}
    />
  );
}
