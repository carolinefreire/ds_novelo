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

## Curadoria visual pública baseada no JSON original

- Fonte integral e imutável: `data/curadoria-original-2026-11-24.json` (último JSON enviado pela proprietária, com 92 registros, 12 aprovados, 14 reprovados e 66 pendentes).
- A galeria em `curadoria.html` lista exatamente 27 arquivos gráficos, 52 ícones Lucide e 13 elementos/categorias de estilo/código, incluindo **os comentários originais e o estado exato** de cada registro.
- As 27 imagens do repositório principal foram inventariadas. O DS publica prévias das artes (inclusive rejeitadas, apenas para avaliação, por autorização expressa da proprietária) sem alterar os originais nem promover seu status. O logotipo PNG original ainda exige sincronização binária segura.
- Ícones importados em `lucide-react` são visualizados via SVG da distribuição Lucide; variáveis de cor e componentes visuais são exibidos conforme os valores e traçados do CSS/React de origem.
- **Única ação pública: Abrir Issue de ajuste**. Não há botões Aprovar ou Desaprovar; o workflow de Issues não tem gatilho de escrita, e comentários nunca modificam arquivos automaticamente.
- Rejeições e observações históricas são visíveis, mas exclusão de arquivos só ocorre em processo administrativo separado, mediante autorização.
- O arquivo `data/review-catalog.json` é histórico e não serve mais como fonte principal da galeria.
- As ilustrações PNG geradas nas conversas e ainda ausentes do repositório principal são um inventário distinto; não estão cobertas pelo JSON de 92 itens e requerem importação dos arquivos originais para aparecer no site, incluindo a família final da Issue #10.
- A publicação oficial usa `.github/workflows/pages.yml`. O fluxo Jekyll legado não deve fazer deploy automático paralelo.

### Limitação de privacidade

**A página de curadoria não é privada.** O GitHub Pages é uma hospedagem pública. Os comandos que alteram arquivos são restritos por identidade e permissões do GitHub; as miniaturas e Issues ficam públicas. Para ocultar também os originais pendentes e comentários, é necessário um backend privado e uma área autenticada, ainda não provisionados.

### Acervo pendente de migração

O inventário inicial contém os metadados dos 27 arquivos gráficos do repositório principal, que é **privado**. As imagens pendentes não são copiadas para o Pages público. Os mockups locais históricos e o arquivo binário final aprovado na Issue #10 **não foram enviados automaticamente**; os mockups de telefone na apresentação são exemplos conceituais, claramente identificados. Não publicar imagens pendentes sem aprovação.
