# Novelo · Site institucional (branch `apresentacao_novelo`)

Esta pasta apresenta a Novelo como **site de rolagem contínua**, não como slides.

## Conteúdo
- Texto institucional aprovado: ideia, marca, princípios, funcionalidades, Trama da Vida, Novelo da Vida Real, Novo Elo, empresas, badges colaborativos, LGPD, empregabilidade e Política Nacional de Cuidados
- Os mockups de telas anteriormente exibidos foram retirados da página
- Personagens e voluntários individuais da curadoria, por referência aos arquivos aprovados do `ds_novelo`
- Logo oficial priorizada pelo arquivo original de `carolinefreire/novelo`; há alternativa local em `assets/logo-novelo.png`

## Arquivos
- `demo/index.html` — página e conteúdo
- `demo/styles.css` — estilo e responsividade
- `demo/script.js` — menu mobile e animações
- `demo/assets/` — imagens de demonstração e logo local
- `../assets/` — voluntários aprovados do Design System

## Duas imagens aguardando o arquivo final
1. `carinho_em_fios_coloridos.png`: arte identificada na curadoria pela autora. O arquivo original de alta qualidade ainda não foi identificado entre os binários no repositório. Não usar a versão anterior sem tecido como se fosse a aprovada.
2. **Família da issue #10 (pai, mãe e criança)**: a aprovação consta em `data/acervo.json`, mas está marcada `aprovado_pendente_de_arquivo` (`path: null`). Não substituir pela cena de três gerações ou por outro casal e alegar que é o original.

As artes acima só devem ser inseridas depois que os respectivos arquivos originais forem localizados ou sincronizados. A página não apresenta imagens incorretas como se fossem essas versões aprovadas.

## Publicação
A branch é separada de `main`. O GitHub Pages atual não publica automaticamente o conteúdo de `demo/` nesta branch. Para visualizar, use um servidor estático na raiz do repositório e abra `/demo/` ou faça o deploy de uma prévia da branch.
