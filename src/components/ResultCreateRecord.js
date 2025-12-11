import { useState } from "react";

export default function GetResultCreateRecord({ result }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="res-create-record">
      <span className="res-text">{result}</span>

      <button className="res-close-btn" onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
}
