import * as seisplotjs from "seisplotjs";

export function parseGraphicData(data, startTime, endTime) {
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