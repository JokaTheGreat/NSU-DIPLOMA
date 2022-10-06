import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import "./Vadati.css";

export function Vadati({ times }) {
    const [plotData, setPlotData] = useState([]);

    const xyData = {
        x: [0, 100],
        y: [0, 100],
        type: 'scatter',
        mode: 'lines',
        name: 'x=y',
        marker: { color: '#61dafb88' },
        line: { dash: 'dashdot' },
    };

    const defaultLayout = {
        margin: {
            t: 1,
            r: 1,
            b: 40,
            l: 40,
        },
        font: {
            color: "#61dafb",
        },
        paper_bgcolor: "#282c34",
        plot_bgcolor: "#282c34",
        yaxis: {
            linecolor: "#61dafb",
            mirror: true,
            gridcolor: "#61dafb44",
        },
        xaxis: {
            linecolor: "#61dafb",
            mirror: true,
            gridcolor: "#61dafb44",
        },
    };

    useEffect(() => {
        const coords = times.filter(item => item?.startTime && item?.waves?.length > 1)
            .map((item) => {
                const MILI_IN_SEC = 1000;
                const PwaveId = item.waves.findIndex(wave => wave.phase === "P");
                const PwaveTime = item.waves[PwaveId].time.getTime() / MILI_IN_SEC;
                const SwaveTime = item.waves[PwaveId ? 0 : 1].time.getTime() / MILI_IN_SEC;

                return { x: PwaveTime - item.startTime.getTime() / MILI_IN_SEC, y: SwaveTime - PwaveTime };
            });

        setPlotData([{
            x: coords.map(item => item.x),
            y: coords.map(item => item.y),
            type: 'scatter',
            mode: 'markers',
            name: 'waves',
            marker: { color: '#61dafb' },
        }, {
            ...xyData
        }]);
    }, [times]);

    return (
        <>
            <h2>Vadati graphic:</h2>
            <div className="vadati-graph__container">
                <Plot
                    className="vadati-graph"
                    layout={defaultLayout}
                    data={plotData}
                    config={{
                        modeBarButtonsToRemove: [
                            "toImage",
                            "pan2d",
                            "zoom2d",
                            "zoomIn2d",
                            "zoomOut2d",
                            "autoScale2d",
                            "lasso2d",
                            "resetScale2d",
                            "select2d"
                        ],
                        displaylogo: false,
                    }}
                />
            </div>
        </>
    );
}