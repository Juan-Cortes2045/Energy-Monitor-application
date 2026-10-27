import {
  Crown,
  Gauge,
  Home,
  HousePlus,
  PartyPopper,
  Plug,
  Unplug,
  UserMinus,
  UserPlus,
  Users,
  Trash2,
} from "lucide-react";

/**
 * Ícono de cada notificación de actividad, por su clave de texto; una clave sin ícono propio usa
 * {@link FALLBACK_ACTIVITY_ICON}.
 */
export const ACTIVITY_ICONS = {
  "activity.account.welcome": PartyPopper,
  "activity.home.created": HousePlus,
  "activity.home.joined": Home,
  "activity.home.member-joined": UserPlus,
  "activity.home.member-left": UserMinus,
  "activity.home.member-removed": UserMinus,
  "activity.home.removed-you": UserMinus,
  "activity.home.thresholds-updated": Gauge,
  "activity.home.ownership-received": Crown,
  "activity.home.ownership-given": Crown,
  "activity.home.owner-changed": Crown,
  "activity.home.deleted": Trash2,
  "activity.home.deleted-by-you": Trash2,
  "activity.device.linked": Plug,
  "activity.device.unlinked": Unplug,
};

export const FALLBACK_ACTIVITY_ICON = Users;
