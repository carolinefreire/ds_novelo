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

## Curadoria visual

- A galeria de `curadoria.html` exibe os arquivos visuais que **já são públicos** no repositório do aplicativo.
- **Aprovar / Desaprovar / Ajustar** abrem uma Issue preenchida; a decisão é confirmada quando a administradora envia a Issue no GitHub.
- A automação só atua em solicitações criadas pela conta `carolinefreire`. A execução é registrada no GitHub Actions.
- **Aprovar:** cria cópia organizada em `novelo/public/brand/curadoria/aprovados/` e publica a arte no acervo do DS, preservando a origem.
- **Desaprovar:** exclui apenas o arquivo apontado no repositório principal após barrar recursos essenciais e referências em uso; preserva o histórico Git.
- **Ajustar:** registra o comentário em Issue; a nova ilustração precisa ser criada e aprovada em conversa com o assistente.
- O nome do segredo no repositório **ds_novelo** deve ser `NOVELO_GITHUB_TOKEN`. O fine-grained PAT deve ter **Contents: Read and write** no repositório `carolinefreire/novelo`. Nunca coloque o token em HTML ou Issues.

### Limitação de privacidade

**A página de curadoria não é privada.** O GitHub Pages é uma hospedagem pública. Os comandos que alteram arquivos são restritos por identidade e permissões do GitHub; as miniaturas e Issues ficam públicas. Para ocultar também os originais pendentes e comentários, é necessário um backend privado e uma área autenticada, ainda não provisionados.

### Acervo pendente de migração

O catálogo inicial inclui os 27 arquivos gráficos já públicos no repositório principal. Os mockups locais históricos e o arquivo binário final aprovado na Issue #10 **não foram enviados automaticamente**; os mockups de telefone na apresentação são exemplos conceituais, claramente identificados. Não publicar imagens pendentes sem aprovação.
