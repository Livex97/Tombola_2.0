#!/bin/bash
#
# release.sh - Rilascia una nuova versione dell'app Tombola 2.0
#
# Cosa fa:
#   1. Valida la versione semantica fornita (es. 1.2.3)
#   2. Aggiorna il campo "version" in package.json e package-lock.json
#   3. Crea un commit "Release vX.Y.Z"
#   4. Crea il tag annotato "vX.Y.Z"
#   5. Esegue push del commit e del tag su origin
#
# Uso:
#   ./release.sh 1.2.0
#
set -euo pipefail

# ---- Controllo argomenti ----
if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <versione>   (es. 1.2.0)"
  exit 1
fi

VERSION="$1"

# ---- Validazione versione semantica (X.Y.Z con optional pre-release) ----
if ! echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z._-]+)?$'; then
  echo "Errore: '$VERSION' non è una versione semantica valida (es. 1.2.3)."
  exit 1
fi

# ---- Verifica che siamo in una repo git pulita abbastanza ----
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Errore: non sei dentro una repository git."
  exit 1
fi

# ---- Aggiorna la versione nei file del progetto ----
# npm version aggiorna automaticamente package.json e package-lock.json
npm version "$VERSION" --no-git-tag-version --allow-same-version

TAG="v$VERSION"

# ---- Commit + Tag ----
git add package.json package-lock.json
git commit -m "Release $TAG"
git tag -a "$TAG" -m "Release $TAG"

# ---- Push su origin ----
git push origin HEAD
git push origin "$TAG"

echo ""
echo "✅ Rilasciata la versione $TAG e inviata a origin."
echo "   La GitHub Action costruirà l'immagine Docker associata al tag."
