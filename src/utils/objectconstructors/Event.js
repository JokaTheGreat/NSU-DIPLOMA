import {
  parseEventMagnitude,
  parseEventPicks,
  parseEventTime,
} from "../parsedata";

export class Event {
  constructor(event) {
    this.eventId = event.getAttribute("publicID");
    this.magnitude = parseEventMagnitude(event);
    this.time = parseEventTime(event);
    this.picks = parseEventPicks(event);
  }
}
