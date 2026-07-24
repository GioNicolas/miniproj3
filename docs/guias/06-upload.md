# Guia 06 — Upload de arquivos (tecnologia extra)

Para a feature avançada **Posts com imagem** — a única do catálogo marcada
"tecnologia extra" (dispensa `core/` e medição; os gates dela são o teste
oculto e a defesa). Este guia mostra o upload de UM arquivo genérico; ligar
isso ao post é trabalho seu.

## Backend

### 1. Receber o arquivo

FastAPI recebe upload com `UploadFile` (é multipart, não JSON):

```python
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.deps import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

PASTA = Path("uploads")
PERMITIDAS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_BYTES = 2 * 1024 * 1024  # 2 MB


@router.post("", status_code=201)
async def subir_arquivo(arquivo: UploadFile, user=Depends(get_current_user)):
    ext = Path(arquivo.filename or "").suffix.lower()
    if ext not in PERMITIDAS:
        raise HTTPException(422, f"extensão {ext} não permitida")

    conteudo = await arquivo.read()
    if len(conteudo) > MAX_BYTES:
        raise HTTPException(422, "arquivo maior que 2 MB")

    PASTA.mkdir(exist_ok=True)
    nome = f"{uuid.uuid4().hex}{ext}"  # nunca confie no filename do cliente
    (PASTA / nome).write_bytes(conteudo)
    return {"url": f"/uploads/{nome}"}
```

Por que `uuid` no nome: o filename vem do cliente — pode colidir, pode conter
`../`. Gerar o nome no servidor resolve os dois.

### 2. Servir os arquivos

Em `main.py`, depois do `include_router`:

```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles

Path("uploads").mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### 3. Não commite os uploads

Adicione ao `.gitignore` do repo:

```
uploads/
```

### 4. Verificação

```bash
DEBUG=true make dev-back
curl -s -X POST localhost:8000/upload -H "X-User-Id: 1" -F "arquivo=@alguma_foto.png"
# → {"url":"/uploads/3f2a....png"}
# abra http://localhost:8000/uploads/3f2a....png no browser → a imagem aparece
```

## Frontend

`<input type="file">` + `FormData`. **O erro clássico**: setar `Content-Type`
na mão. Não sete — o browser precisa colocar o boundary do multipart sozinho
(o `apiPost` do `lib/api.ts` força JSON, então upload usa `fetch` puro):

```tsx
const [arquivo, setArquivo] = useState<File | null>(null);

// no JSX:
<input type="file" accept="image/*" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />

// no submit:
const form = new FormData();
form.append("arquivo", arquivo!);
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
  method: "POST",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  // SEM "Content-Type" aqui — o browser põe multipart/form-data com boundary
  body: form,
});
const { url } = await res.json();
```

A `url` devolvida é relativa ao backend: para exibir, monte
`${NEXT_PUBLIC_API_URL}${url}` no `src` da imagem.

Deu 422 sem entender? Confira na aba Network se o request é
`multipart/form-data; boundary=...` — se estiver `application/json` ou sem
boundary, você setou o Content-Type na mão (guia 04).
