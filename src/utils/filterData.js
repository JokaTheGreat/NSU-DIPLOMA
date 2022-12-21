import { filterInstance } from "./Filter";

export const filterData = (seismogramByChannel) => {
  return seismogramByChannel.map((seimogram) => {
    const yChannelRMean = seimogram.y.map((y) => y - seimogram.y[0]);

    return filterInstance.iirFilter.simulate(yChannelRMean)
  }
  );
};
