"""Extrae el directorio de bandas de musicofrades.com (listados por tipo/provincia + fichas)."""
import html, json, re, sys, time, urllib.request
from pathlib import Path

OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (compatible; directorio-research)"
BASE = "https://musicofrades.com/directorio-de-bandas/"
TIPOS = {"bandas-de-cornetas-y-tambores": "cornetas_tambores", "agrupaciones-musicales": "agrupacion_musical", "bandas-de-musica": "banda_musica"}
PROVS = "alava albacete alicante almeria asturias avila badajoz barcelona burgos caceres cadiz cantabria castellon ceuta ciudad-real cordoba cuenca gerona granada guadalajara guipuzcoa huelva huesca islas-baleares jaen la-coruna la-rioja las-palmas leon lerida lugo madrid malaga melilla murcia navarra orense palencia pontevedra salamanca santa-cruz-de-tenerife segovia sevilla soria tarragona teruel toledo valencia valladolid vizcaya zamora zaragoza".split()

def get(url, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            print("error", url, e, file=sys.stderr); time.sleep(3 * (i + 1))
    return None

def limpio(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

# 1) Listados por tipo y provincia
lista_path = OUT / "lista.json"
if lista_path.exists():
    bandas = json.loads(lista_path.read_text())
else:
    bandas = {}
    for tslug, tipo in TIPOS.items():
        for p in PROVS:
            h = get(f"{BASE}{tslug}/{p}/"); time.sleep(0.6)
            if not h: continue
            i = h.find('class="directorio-bandas-provincia"')
            if i < 0: continue
            fin = h.find("Páginas recomendadas", i)
            bloque = h[i:fin] if fin > 0 else h[i:i+500000]
            for sec in re.split(r'<div class="localidad-seccion"', bloque)[1:]:
                m = re.search(r'class="localidad-titulo"[^>]*>(.*?)</p>', sec, re.S)
                loc = limpio(m.group(1)) if m else ""
                for href, nombre in re.findall(r'<a[^>]+href="(https://musicofrades\.com/directorio/\d+-[^"]+)"[^>]*>(.*?)</a>', sec, re.S):
                    bid = re.search(r"/directorio/(\d+)-", href).group(1)
                    n = limpio(nombre)
                    if not n: continue
                    bandas[bid] = {"id": int(bid), "url": href, "nombre_listado": n, "tipo": tipo, "localidad_listado": loc, "provincia_slug": p}
            print(tslug, p, len(bandas), flush=True)
    lista_path.write_text(json.dumps(bandas, ensure_ascii=False, indent=0))

# 2) Fichas
fichas_path = OUT / "fichas.jsonl"
hechas = set()
if fichas_path.exists():
    for line in fichas_path.read_text().splitlines():
        hechas.add(str(json.loads(line)["id"]))
with fichas_path.open("a") as f:
    for n, (bid, b) in enumerate(sorted(bandas.items(), key=lambda x: int(x[0]))):
        if bid in hechas: continue
        h = get(b["url"]); time.sleep(0.6)
        datos = {}
        if h and "DATOS DE CONTACTO" in h:
            sec = h[h.find("DATOS DE CONTACTO"):]
            sec = sec[:sec.find("</table>")]
            celdas = re.findall(r"<td>(.*?)</td>", sec, re.S)
            for etiqueta, valor in zip(celdas[0::2], celdas[1::2]):
                k = limpio(etiqueta).rstrip(":").split()[-1].lower() if limpio(etiqueta) else ""
                href = re.search(r'href="([^"]*)"', valor)
                texto = limpio(valor)
                datos[k] = {"texto": texto, "href": href.group(1) if href else None}
        f.write(json.dumps({"id": int(bid), **b, "ficha": datos}, ensure_ascii=False) + "\n"); f.flush()
        if n % 50 == 0: print("fichas", n, flush=True)
print("FIN", flush=True)
