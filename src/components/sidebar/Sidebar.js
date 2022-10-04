import { useEffect, useState } from "react";
import "./Sidebar.css";
import { getEventData, parseEventData } from "../../utils";

export function Sidebar({ onClickCallback }) {
  const [data, setData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(-1);

  const setDataAsync = async () => {
    const data = await getEventData();
    setData(parseEventData(data));
  };

  useEffect(() => {
    setDataAsync();
  }, []);

  useEffect(() => {
    if (selectedEventId < 0) {
      return;
    }

    onClickCallback(data[selectedEventId]);
  }, [selectedEventId]);

  return (
    <div className="sidebar">
      {data.map((item, index) => {
        return (
          <div
            key={"" + item.magnitude + item.time}
            className={"sidebar__element" + (index === selectedEventId ? " sidebar__element_active" : "")}
            onClick={() => setSelectedEventId(index)}
          >
            Magnitude: {item.magnitude} <br />
            Date: {item.time}
          </div>
        );
      })}
    </div>
  );
}