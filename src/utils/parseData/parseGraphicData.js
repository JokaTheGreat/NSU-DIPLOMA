import * as seisplotjs from "seisplotjs";

export function parseGraphicData(data, startTime, endTime) {
    const dataRecords = seisplotjs.miniseed.parseDataRecords(data);
    const seismogram = seisplotjs.miniseed.merge(dataRecords);

    const filter = seisplotjs.filter.createChebyshevI(4, 0.5, seisplotjs.filter.LOW_PASS, 0, 1, 0.005);
    const filteredSeismogram = seisplotjs.filter.applyFilter(filter, seismogram);

    const x = [];
    const y = filteredSeismogram._segmentArray[0].y;
    const step = (endTime - startTime) / y.length;

    y.forEach((item, i) => {
        x.push(new Date(Math.round(startTime.getTime() + step * i)));
    });

    return { x, y };
}