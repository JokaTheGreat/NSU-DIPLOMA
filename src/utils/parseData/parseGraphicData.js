import * as seisplotjs from "seisplotjs";

export function parseGraphicData(data) {
    const dataRecords = seisplotjs.miniseed.parseDataRecords(data);
    const seismogramByChannel = seisplotjs.miniseed.seismogramPerChannel(dataRecords);

    const filter = seisplotjs.filter.createChebyshevI(4, 0.5, seisplotjs.filter.LOW_PASS, 0, 1, 0.005);
    const filteredSeismogramByChannel = seismogramByChannel.map(item => seisplotjs.filter.applyFilter(filter, item));

    const channelNames = filteredSeismogramByChannel.map(item => item.channelCode);
    const xByChannel = [[], [], []];
    const yByChannel = filteredSeismogramByChannel.map(item => item.y);
    const stepByChannel = filteredSeismogramByChannel.map(item => (item._endTime._d - item._startTime._d) / item.y.length);
    
    yByChannel.forEach((item, i) => {
        item.forEach((_, j) => {
            xByChannel[i].push(new Date(Math.round(filteredSeismogramByChannel[i]._startTime._d.getTime() + stepByChannel[i] * j)));
        })
    });

    return { channelNames, xByChannel, yByChannel };
}