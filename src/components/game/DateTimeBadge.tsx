import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

function DateTimeBadge() {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentDateTime(`${formattedDate} ${formattedTime}`);
    };

    // Atualiza imediatamente e depois a cada segundo
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    // Limpa o intervalo quando o componente desmonta
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Badge variant="secondary" className="fixed top-4 left-4 z-50 bg-black/70 text-white border-none">
      {currentDateTime}
    </Badge>
  );
}

export default DateTimeBadge;