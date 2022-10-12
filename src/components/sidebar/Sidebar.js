import { useEffect, useState } from "react";
import "./Sidebar.css";
import { getEventData, parseEventData } from "../../utils";

function parseTime(time) {
  const timeArray = time.match(/\d{2}/g);

  return `${timeArray[3]}.${timeArray[2]}.${timeArray[1]} ${timeArray[4]}:${timeArray[5]}`;
}

export function Sidebar({ onClickCallback }) {
  const [data, setData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(-1);

  const setNewData = async () => {
    const data = await getEventData();
    if (!data) {
      alert("server has no event data");
      return; 
    }
    
    setData(parseEventData(data));
  };

  useEffect(() => {
    setNewData();
  }, []);

  useEffect(() => {
    if (selectedEventId < 0 || !data || !data[selectedEventId]) {
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
            Date: {parseTime(item.time)}
          </div>
        );
      })}
    </div>
  );
}