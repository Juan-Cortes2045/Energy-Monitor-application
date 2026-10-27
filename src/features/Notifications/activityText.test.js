import { describe, it, expect, beforeAll } from "vitest";
import i18n from "../../i18n";
import { activityText } from "./activityText";
import { toUiActivity } from "../../services/notifications/notificationApi";

let t;
beforeAll(async () => {
  await i18n.changeLanguage("es");
  t = i18n.getFixedT("es", "notifications");
});

const activity = (messageKey, params = {}, homeId = "hom0000001") =>
  toUiActivity({ id: "n1", source: "HOME", messageKey, homeId, params, createdAt: "2026-10-27T09:00:00Z", read: false });

describe("toUiActivity", () => {
  it("quita la versión de la clave y toma los nombres de la notificación", () => {
    const item = activity("activity.home.member-joined.v1", { homeName: "Casa", actorName: "Ana" });
    expect(item).toMatchObject({ kind: "activity", key: "activity.home.member-joined", home: "Casa", actor: "Ana" });
  });

  it("sin nombre de hogar guardado usa el de los hogares del usuario", () => {
    const item = toUiActivity(
      { id: "n1", messageKey: "activity.device.linked.v1", homeId: "hom0000001", params: {} },
      new Map([["hom0000001", "Finca"]]),
    );
    expect(item.home).toBe("Finca");
  });
});

describe("activityText", () => {
  it("arma el mensaje con los nombres guardados", () => {
    const text = activityText(activity("activity.home.member-joined.v1", { homeName: "Casa", actorName: "Ana" }), t);
    expect(text).toEqual({ title: "Nuevo miembro", message: "Ana se unió a \"Casa\"." });
  });

  it("la bienvenida no es de ningún hogar", () => {
    const text = activityText(activity("activity.account.welcome.v1", {}, null), t);
    expect(text.title).toBe("Bienvenido a Energy Monitor");
  });

  it("un dispositivo vinculado sin quién lo vinculó tiene su propia frase", () => {
    const withActor = activity("activity.device.linked.v1", { homeName: "Casa", deviceName: "Nevera", actorName: "Ana" });
    const withoutActor = activity("activity.device.linked.v1", { homeName: "Casa", deviceName: "Nevera" });
    expect(activityText(withActor, t).message).toBe("Ana vinculó \"Nevera\" a \"Casa\".");
    expect(activityText(withoutActor, t).message).toBe("Se vinculó \"Nevera\" a \"Casa\".");
  });

  it("sin nombres usa los genéricos, sin comillas y con mayúscula inicial", () => {
    const text = activityText(activity("activity.home.thresholds-updated.v1"), t);
    expect(text.message).toBe("Alguien cambió los umbrales de consumo de tu hogar.");
    const en = activityText(activity("activity.device.unlinked.v1"), i18n.getFixedT("en", "notifications"));
    expect(en.message).toBe("A device was unlinked from your home.");
  });

  it("una clave que esta versión de la web no conoce se muestra como novedad genérica", () => {
    const text = activityText(activity("activity.home.something-new.v2", { homeName: "Casa" }), t);
    expect(text).toEqual({ title: "Novedades en Energy Monitor", message: "Hay novedades en \"Casa\"." });
  });
});
