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
