const ERRORES: Record<string, string> = {
  datos: "Revisa el texto: el título debe tener entre 3 y 120 caracteres y el mensaje no puede estar vacío.",
  ritmo: "Vas muy rápido. Espera un momento antes de volver a publicar.",
  permiso: "No tienes permiso para hacer esto (el tema puede estar cerrado o tu cuenta bloqueada).",
  repetido: "Eso ya estaba hecho.",
  guardar: "No se pudo guardar. Inténtalo de nuevo.",
};

const OK: Record<string, string> = {
  denuncia: "Gracias. Un moderador revisará la denuncia.",
  bloqueado: "Usuario bloqueado: ya no puede publicar.",
  desbloqueado: "Usuario desbloqueado.",
};

export default function Avisos({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="error" role="alert">{ERRORES[error] ?? ERRORES.guardar}</p>;
  if (ok && OK[ok]) return <p className="aviso-ok" role="status">{OK[ok]}</p>;
  return null;
}
