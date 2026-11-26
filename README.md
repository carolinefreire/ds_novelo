# Novelo · Design System

Site de apresentação pública da identidade visual, dos princípios e da experiência Novelo.

## Arquitetura
- `index.html`: apresentação pública para parceiros, colaboradores e visitantes.
- `styles.css` e `app.js`: estilos e interações acessíveis, sem compilação nem Lovable.
- `assets/`: personagens e cenas **já aprovados**, copiados como arquivos sem redesenho quando tecnicamente possível.
- `data/acervo.json`: referências e status das artes aprovadas.
- `.github/ISSUE_TEMPLATE/`: solicitações de alteração e registro de decisões com identidade GitHub.
- `curadoria.html`: acesso ao fluxo administrativo do GitHub; não é uma área privada por si só.

## Publicação
GitHub → **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**.

Endereço esperado após ativação: https://carolinefreire.github.io/ds_novelo/

## Segurança
GitHub Pages não oferece autenticação ou área privada nativa. As ações reais devem exigir identidade autorizada **no GitHub**, nunca no navegador. Não armazene tokens do GitHub em HTML ou JavaScript público. Os GitHub Issues são públicos neste repositório público; não inclua informações pessoais, arquivos sigilosos ou artes não publicáveis em Issues.

A curadoria operacional pelo GitHub não consome créditos do Lovable. A geração de uma imagem revisada exige nova solicitação ao assistente; GitHub Issues, sozinho, não aciona automaticamente o ChatGPT.

## Fonte de verdade
Aplicativo: [carolinefreire/novelo](https://github.com/carolinefreire/novelo).

Este repositório não deve modificar o aplicativo nem o repositório principal sem revisão. A imagem da família aprovada na Issue #10 deve ser incluída por upload binário do original, sem substituição de versões anteriores.

## Princípios
- Usar somente o logotipo e símbolos oficiais da Novelo, nunca recriações.
- Personagens com textura realista de crochê/amigurumi.
- Não presumir aprovações de imagens coletivas ou candidatos ainda em revisão.
- Mockups demonstrativos identificados como tal, até a incorporação dos originais.
- Público vê o que foi aprovado; a aprovação e a exclusão exigem autorização.
