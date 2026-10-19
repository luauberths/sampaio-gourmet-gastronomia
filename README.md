# Sampaio Gourmet & Gastronomia

Site institucional estático, com HTML, CSS e JavaScript. Os arquivos do site não precisam de build nem de dependências de execução. O Node.js é utilizado somente pelas ferramentas locais de verificação e prévia.

## Executar e verificar

Na pasta do projeto, com Node.js instalado:

```sh
npm run check
npm start
```

Não é necessário executar `npm install`. A prévia fica disponível em `http://127.0.0.1:8000` e aceita tanto `/cardapios` quanto `/cardapios.html`, seguindo os caminhos utilizados no site. Encerre com `Ctrl+C`.

O comando de verificação confere sintaxe dos scripts do site, imagens HTML com `alt`, referências locais a arquivos e fragmentos HTML/SVG, caminhos CSS/JS sem query string, tokens CSS definidos e utilizados, cores literais fora dos tokens, comentários HTML/CSS e convenções básicas de espaços e quebras de linha. A revisão de comentários JavaScript faz parte da revisão manual do código. Essa checagem estática deve ser acompanhada de uma revisão no navegador quando houver mudança de layout ou comportamento.

## Organização dos estilos

| Arquivo | Responsabilidade |
| --- | --- |
| `CSS/base.css` | Tokens de cores e fontes, normalização, títulos, cabeçalhos, textos, painéis e componentes compartilhados. |
| `CSS/layout.css` | Navegação, estrutura das páginas, rodapé e comportamento responsivo da estrutura geral. |
| `CSS/home.css` | Apresentação inicial, mensagens, botões principais e galeria. |
| `CSS/menus.css` | Cardápios, acordeões, grupos de itens e organização dos menus. |
| `CSS/quote.css` | Formulário de orçamento e calendário. |
| `CSS/about.css` | Ajustes exclusivos da página sobre a empresa. |
| `CSS/partners.css` | Organização dos parceiros. |
| `CSS/clients.css` | Avaliações, estrelas, cartões, carrossel e estados de carregamento. |
| `CSS/mobile-sections.css` | Exibição das seções incorporadas à home no celular. |

Carregue `base.css` antes de `layout.css` e dos estilos específicos. A home carrega os estilos de todas as páginas porque, até 950 px, incorpora o conteúdo dos outros cinco HTMLs por meio de `Javascript/mobile-sections.js`. Os estilos de avaliações e calendário também precisam contemplar elementos gerados por JavaScript.

## Convenções de manutenção

- Use inglês em nomes de variáveis, funções e custom properties. Preserve os textos públicos em português e os contratos de URLs, IDs, dados e integrações existentes.
- Utilize dois espaços de indentação, UTF-8, quebras de linha LF e uma quebra de linha no final do arquivo. As preferências estão em `.editorconfig` e `.prettierrc.json`.
- Defina cores no `:root` de `CSS/base.css` e reutilize os tokens com `var(--token)`. Gradientes, transparências, fontes e ícones compartilhados também ficam centralizados nesse arquivo.
- As cores dos SVGs incorporados em data URIs estão contidas nos respectivos tokens de ícone. O desenho de `Images/olive_branch.svg` possui a própria cor interna; SVGs carregados como imagem não herdam as custom properties do documento HTML.
- Coloque uma regra em `base.css` quando o mesmo componente e as mesmas declarações forem utilizados em mais de uma página. Deixe os ajustes específicos no CSS da página correspondente. Considere a ordem da cascata e os breakpoints antes de mover regras.
- Antes de remover um seletor, procure seu uso nos HTMLs e nos scripts, incluindo classes de estado, elementos criados dinamicamente e conteúdo incorporado à home.
- Remova tokens sem uso e reaproveite um token existente quando o valor e o significado forem equivalentes.
- Mantenha `alt` descritivo em imagens informativas. Use `alt=""` nas imagens decorativas, quando não houver informação adicional para leitores de tela.
- Referencie os arquivos CSS e JavaScript diretamente, sem `?v=...`, inclusive nos imports dinâmicos.
- Mantenha o código sem comentários; registre decisões e orientações neste README.

## Validação da refatoração

A revisão contemplou os seis HTMLs, nove CSS e sete scripts do site. Os 53 elementos `img` dos HTMLs já possuíam `alt`; as descrições de 12 logos foram melhoradas e os 11 atributos vazios de imagens decorativas foram preservados. O avatar criado dinamicamente nas avaliações também mantém `alt=""` dentro de um elemento decorativo.

Foram retiradas quatro query strings nos HTMLs e duas nos imports dinâmicos. As variáveis e funções internas em português foram traduzidas, preservando os textos, caminhos e dados públicos.

Os testes de navegador comparam a versão original e a refatorada em larguras de desktop e celular. Também verificam menu de navegação, acordeões, calendário, limite de convidados, geração da URL de orçamento e avaliações. As avaliações usam dados simulados, a abertura do WhatsApp é interceptada e as fontes externas são bloqueadas para tornar a comparação reproduzível; esses testes não enviam mensagens nem comprovam disponibilidade de serviços externos.

O detalhamento das alterações, dos quantitativos e das validações está em [GOVERNANCA.md](GOVERNANCA.md).
