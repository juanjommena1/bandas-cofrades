"""Convierte la extracción de Musicofrades (fichas.jsonl) en src/data/bandas.json y supabase/seed_bandas.sql.

Uso: python3 scripts/convertir_musicofrades.py <carpeta_con_fichas.jsonl>
"""
import json, re, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
entrada = Path(sys.argv[1]) / "fichas.jsonl"

def campo(f, k):
    v = f.get(k) or {}
    return (v.get("texto") or "").strip() or None

def enlace(f, k, base):
    v = f.get(k) or {}
    href, texto = (v.get("href") or "").strip(), (v.get("texto") or "").strip()
    if not texto:
        return None
    return href if href and href.rstrip("/") != base.rstrip("/") else texto

bandas = []
for linea in entrada.read_text().splitlines():
    r = json.loads(linea)
    f = r.get("ficha") or {}
    ano = re.search(r"(1[6-9]\d\d|20\d\d)", campo(f, "año") or "")
    slug = r["url"].rstrip("/").rsplit("/", 1)[-1]
    bandas.append({
        "id": f"mc-{r['id']}",
        "slug": slug,
        "nombre": re.sub(r"[\s\-–]+$", "", campo(f, "nombre") or r["nombre_listado"]),
        "tipo": r["tipo"],
        "localidad": campo(f, "localidad") or r["localidad_listado"],
        "provincia": campo(f, "provincia") or r["provincia_slug"].replace("-", " ").title(),
        "musicos": None, "precio_min": None, "precio_max": None,
        # Teléfonos y correos no se copian: suelen ser de personas concretas.
        # La banda los añade ella misma al reclamar su perfil.
        "telefono": None,
        "email": None,
        "repertorio": None, "descripcion": None,
        "ano_fundacion": int(ano.group(1)) if ano else None,
        "web": enlace(f, "web", "https://"),
        "instagram": enlace(f, "instagram", "https://www.instagram.com/"),
        "facebook": enlace(f, "facebook", "https://www.facebook.com/"),
        "youtube": enlace(f, "youtube", "https://www.youtube.com/"),
        "estado": "Extinta" if (campo(f, "estado") or "").lower().startswith("ext") else "Activa",
        "hermandad": campo(f, "hermandad"),
        "fuente_url": r["url"],
    })

bandas.sort(key=lambda b: b["nombre"])
(RAIZ / "src/data/bandas.json").write_text(json.dumps(bandas, ensure_ascii=False, separators=(",", ":")))

def sql(v):
    if v is None: return "null"
    if isinstance(v, int): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

cols = ["slug", "nombre", "tipo", "localidad", "provincia", "telefono", "email", "ano_fundacion", "web", "instagram", "facebook", "youtube", "estado", "hermandad", "fuente_url"]
filas = [f"({', '.join(sql(b[c]) for c in cols)})" for b in bandas]
(RAIZ / "supabase/seed_bandas.sql").write_text(
    "-- Bandas importadas de Musicofrades. Ejecutar después de las migraciones.\n"
    f"insert into bandas ({', '.join(cols)}) values\n" + ",\n".join(filas) + "\non conflict (slug) do nothing;\n")
print(len(bandas), "bandas")
