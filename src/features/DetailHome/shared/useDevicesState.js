import { useCallback, useState } from "react";
import { INITIAL_DEVICES } from "./deviceTypes";

export function useDevicesState() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  const addDevice = useCallback((newDevice) => {
    setDevices((prev) => [
      ...prev,
      {
        id: Date.now(),
        applianceType: "other",
        status: "online",
        signal: 78,
        consumption: 0,
        ...newDevice,
      },
    ]);
  }, []);

  const removeDevice = useCallback((deviceId) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  }, []);

  return { devices, addDevice, removeDevice };
}
