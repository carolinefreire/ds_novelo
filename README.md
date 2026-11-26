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
GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions → Save**. Em seguida, acesse **Actions → Publicar Design System Novelo → Run workflow**. O Pages precisa ser habilitado pela proprietária; o token padrão do GitHub Actions não tem permissão para criar o site sozinho.

Endereço esperado após ativação: https://carolinefreire.github.io/ds_novelo/

## Segurança
GitHub Pages não oferece autenticação ou área privada nativa. As ações reais devem exigir identidade autorizada **no GitHub**, nunca no navegador. Não armazene tokens do GitHub em HTML ou JavaScript público. Os GitHub Issues são públicos neste repositório público; não inclua informações pessoais, arquivos sigilosos ou artes não publicáveis em Issues.

A curadoria por Issues não consome créditos do Lovable. A geração de uma imagem revisada exige nova solicitação ao assistente; GitHub Issues, sozinho, não aciona automaticamente o ChatGPT.

## Fonte de verdade
Aplicativo: [carolinefreire/novelo](https://github.com/carolinefreire/novelo).

Este repositório não deve modificar o aplicativo nem o repositório principal sem revisão. A imagem da família aprovada na Issue #10 deve ser incluída por upload binário do original, sem substituição de versões anteriores.

## Princípios
- Usar somente o logotipo e símbolos oficiais da Novelo, nunca recriações.
- Personagens com textura realista de crochê/amigurumi.
- Não presumir aprovações de imagens coletivas ou candidatos ainda em revisão.
- Mockups demonstrativos identificados como tal, até a incorporação dos originais.
- Público vê o que foi aprovado; a aprovação e a exclusão exigem autorização.

## Curadoria visual pública (somente Issues)

- `curadoria.html` apresenta os 27 itens do inventário com miniaturas **quando o arquivo já está publicado** no DS. Imagens pendentes do repositório privado não são expostas em Pages.
- Clicar em uma imagem abre uma visualização ampliada. Se o original for privado, a página explica a indisponibilidade em vez de apresentar uma imagem diferente.
- O único botão de solicitação é **Abrir Issue de ajuste**. Qualquer visitante com conta GitHub pode registrar uma observação pública.
- **Abrir Issues não aprova, desaprova, exclui nem modifica qualquer arquivo.** A automação de curadoria não reage mais a Issues e tem permissões somente de leitura.
- Toda decisão de publicação ou exclusão exige uma operação administrativa separada e explicitamente autorizada.
- A antiga automação de aprovar/desaprovar por Issue foi desativada, inclusive para a proprietária. O script histórico em `scripts/curadoria.mjs` não é executado por Issues.
- Para importar logo e fio oficiais já aprovados do repositório privado, existe fluxo separado `sync-assets.yml`, acionado com autorização. O segredo `NOVELO_GITHUB_TOKEN` não fica exposto no HTML.

### Limitação de privacidade

**A página de curadoria não é privada.** O GitHub Pages é uma hospedagem pública. Os comandos que alteram arquivos são restritos por identidade e permissões do GitHub; as miniaturas e Issues ficam públicas. Para ocultar também os originais pendentes e comentários, é necessário um backend privado e uma área autenticada, ainda não provisionados.

### Acervo pendente de migração

O inventário inicial contém os metadados dos 27 arquivos gráficos do repositório principal, que é **privado**. As imagens pendentes não são copiadas para o Pages público. Os mockups locais históricos e o arquivo binário final aprovado na Issue #10 **não foram enviados automaticamente**; os mockups de telefone na apresentação são exemplos conceituais, claramente identificados. Não publicar imagens pendentes sem aprovação.
