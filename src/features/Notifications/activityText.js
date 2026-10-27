/**
 * Título y mensaje de una actividad, compartidos por la página de Notificaciones y el aviso
 * emergente. Los nombres son los que guardó la notificación al crearse; si falta alguno se usa uno
 * genérico ("tu hogar", "alguien"), sin comillas. Un dispositivo vinculado sin quién lo vinculó
 * tiene su propia frase ({@code messageNoActor}).
 */
export function activityText(item, t) {
  const quoted = (name, fallback) => (name ? t("activity.quoted", { name }) : t(fallback));
  const names = {
    home: quoted(item.home, "activity.yourHome"),
    actor: item.actor ?? t("activity.someone"),
    subject: item.subject ?? t("activity.aMember"),
    device: quoted(item.device, "activity.aDevice"),
  };
  const messageKeys = item.actor ? [`${item.key}.message`] : [`${item.key}.messageNoActor`, `${item.key}.message`];
  const message = t(messageKeys, { ...names, defaultValue: t("activity.generic.message", names) });
  return {
    title: t(`${item.key}.title`, { defaultValue: t("activity.generic.title") }),
    // Una frase que empieza por un nombre genérico ("un dispositivo se…") va con mayúscula.
    message: message.charAt(0).toUpperCase() + message.slice(1),
  };
}
