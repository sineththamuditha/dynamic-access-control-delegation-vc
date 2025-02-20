import React, { useContext, useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { LogContext } from "../context/LogContext";

const Console: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const { logs } = useContext(LogContext); // Get logs from context

  useEffect(() => {
    if (terminalRef.current) {
      terminal.current = new Terminal();
      terminal.current.open(terminalRef.current);
    }

    return () => {
      terminal.current?.dispose();
    };
  }, []);

  // Update the terminal with new logs whenever logs are updated
  useEffect(() => {
    if (terminal.current) {
      // terminal.current.clear();
      if (!logs.length) {
        return;
      }
      const lastLog = logs[logs.length - 1];
      terminal.current?.writeln(lastLog);
    }
  }, [logs]); // Run effect whenever logs change

  return (
    <div className="console">
      <div
        ref={terminalRef}
        style={{ height: "300px", width: "100%", backgroundColor: "black" }}
      />
    </div>
  );
};

export default Console;
