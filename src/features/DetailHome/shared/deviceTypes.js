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

// Nombre del catálogo del backend (appliance_type.name) → clave de la UI
// (icono, color y texto i18n en devices.applianceTypes.*).
export const UI_TYPE_BY_BACKEND_NAME = {
  refrigerator: "fridge",
  washing_machine: "washer",
  television: "tv",
  microwave: "microwave",
  air_conditioner: "ac",
  computer: "pc",
  water_heater: "waterHeater",
  lighting: "lighting",
  other: "other",
};

export const uiApplianceType = (backendName) => UI_TYPE_BY_BACKEND_NAME[backendName] ?? "other";

// Habitaciones que se ofrecen al vincular. Se guardan como clave en
// device.location y se traducen al pintar; un texto libre se muestra tal cual.
export const ROOM_KEYS = ["livingRoom", "kitchen", "laundryRoom", "bedroom", "garage", "other"];
