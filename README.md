# Diário de operações XAUUSD

Página única (HTML) para registrar operações de day trade: data, ativo, resultado em $, pontos, descrição e imagem 900x900.
Os dados ficam salvos no navegador de cada aparelho (IndexedDB), não no GitHub.

## Arquivos
- `index.html` (a página inteira)
- `icon.png` (ícone da aba e da tela inicial do celular)
- `README.md` e `.nojekyll` (opcionais)

## Como publicar
1. Crie um repositório público no GitHub.
2. Envie `index.html` e `icon.png`.
3. Em Settings > Pages, escolha "Deploy from a branch", branch `main`, pasta `/ (root)`.
4. Abra `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Usar no celular
- Abra o link no navegador do celular e use "Adicionar à tela inicial".
- Os dados não sincronizam sozinhos entre aparelhos. Para ver no celular o que foi registrado no computador: exporte o backup no computador e importe no celular.
