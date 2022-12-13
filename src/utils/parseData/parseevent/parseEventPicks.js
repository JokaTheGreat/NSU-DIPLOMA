import { Pick } from "../../objectconstructors";

export const parseEventPicks = (event) =>
  Array.from(event.getElementsByTagName("pick"))
    .map((pick) =>
      pick.querySelector("waveformID").getAttribute("channelCode") !== "HHE"
        ? null
        : new Pick(pick)
    )
    .filter((pick) => pick ?? false);
