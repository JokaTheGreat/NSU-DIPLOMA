import * as seisplotjs from "seisplotjs";
import * as fili from "fili";

export function parseGraphicData(data) {
  const dataRecords = seisplotjs.miniseed.parseDataRecords(data);
  const seismogramByChannel =
    seisplotjs.miniseed.seismogramPerChannel(dataRecords);
  console.log(seismogramByChannel[0].y);

  const iirCalculator = new fili.CalcCascades();
  const iirFilterCoeffs = iirCalculator.highpass({
    order: 2,
    characteristic: "butterworth",
    Fs: Math.round(1 / 0.005),
    Fc: 1,
  });
  const iirFilter = new fili.IirFilter(iirFilterCoeffs);

  const filteredData = seismogramByChannel
    .map((byChannel) => byChannel.y.map((item) => item - byChannel.y[0]))
    .map((item) => iirFilter.simulate(item));

  const channelNames = seismogramByChannel.map((item) => item.channelCode);
  const xByChannel = [[], [], []];
  const yByChannel = filteredData;
  const stepByChannel = seismogramByChannel.map(
    (item) => (item._endTime._d - item._startTime._d) / item.y.length
  );

  yByChannel.forEach((item, i) => {
    item.forEach((_, j) => {
      xByChannel[i].push(
        new Date(
          Math.round(
            seismogramByChannel[i]._startTime._d.getTime() +
              stepByChannel[i] * j
          )
        )
      );
    });
  });

  return { channelNames, xByChannel, yByChannel };
}
