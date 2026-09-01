import {
  Refrigerator,
  WashingMachine,
  Tv,
  Microwave,
  AirVent,
  Monitor,
  Flame,
  Lightbulb,
  Plug,
} from "lucide-react";

export const APPLIANCE_ICON = {
  fridge: Refrigerator,
  washer: WashingMachine,
  tv: Tv,
  microwave: Microwave,
  ac: AirVent,
  pc: Monitor,
  waterHeater: Flame,
  lighting: Lightbulb,
  other: Plug,
};

export const APPLIANCE_TYPE_IDS = Object.keys(APPLIANCE_ICON);

// ── Dispositivos de ejemplo. El nombre y la habitación se resuelven
// con i18n (t) en el render, no como texto fijo, para que se traduzcan
// correctamente sin importar el idioma activo. ──
export const INITIAL_DEVICES = [
  {
    id: 1,
    applianceType: "fridge",
    roomKey: "kitchen",
    status: "online",
    signal: 82,
    consumption: 0.42,
  },
  {
    id: 2,
    applianceType: "washer",
    roomKey: "laundryRoom",
    status: "online",
    signal: 95,
    consumption: 1.15,
  },
  {
    id: 3,
    applianceType: "pc",
    roomKey: "bedroom",
    status: "offline",
    signal: 0,
    consumption: null,
  },
];
