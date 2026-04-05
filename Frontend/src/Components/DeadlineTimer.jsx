import { useEffect, useState } from "react";
import { T } from "../theme";

export default function DeadlineTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calculate() {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) { setTimeLeft("Deadline passed"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(days > 0 ? `${days}d ${hours}h left` : `${hours}h ${mins}m left`);
    }
    calculate();
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
  }, [deadline]);

  const isPast = new Date(deadline) < new Date();

  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      color: isPast ? "#c62828" : T.primary,
      background: isPast ? "#fde8e8" : T.primaryLight,
      padding: "3px 9px", borderRadius: 20, display: "inline-block"
    }}>
      ⏱ {timeLeft}
    </span>
  );
}
