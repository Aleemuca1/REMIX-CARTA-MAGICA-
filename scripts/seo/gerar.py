#!/usr/bin/env python3
"""
Gera as páginas de SEO (HTML estático, lido pelo Google sem JavaScript) em public/.
Para editar: mude o conteúdo em PAGES e rode:  python3 scripts/seo/gerar.py
Cada página vira public/<slug>.html e abre em https://www.cartamagicanatal.com.br/<slug>
"""
import html, json, os, datetime

SITE = "https://www.cartamagicanatal.com.br"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public")
TODAY = datetime.date.today().isoformat()

# ------------------------------------------------------------------ conteúdo
# blocos: ("h2", texto) ("p", texto com <b>/<a> permitido) ("ul", [itens]) ("ol", [itens])
#         ("carta", [parágrafos]) ("cta", (texto, link)) ("dica", texto)
PAGES = [
    {
        "slug": "carta-do-papai-noel-personalizada",
        "title": "Carta do Papai Noel Personalizada com o Nome da Criança",
        "desc": "Crie uma carta do Papai Noel personalizada com o nome, a idade, a cidade e as conquistas do seu filho. Fica pronta em 2 minutos, com voz do Papai Noel e PDF para imprimir.",
        "h1": "Carta do Papai Noel personalizada com o nome do seu filho",
        "lead": "Imagine o rostinho do seu filho quando o Papai Noel chama ele pelo nome, lembra da cidade onde ele mora e elogia o que ele conquistou neste ano. Na Carta Mágica você cria essa carta em 2 minutos, de graça.",
        "emoji": "💌",
        "blocks": [
            ("h2", "O que deixa uma carta do Papai Noel realmente especial"),
            ("p", "Uma carta genérica a criança esquece. Uma carta que fala <b>dela</b> vira lembrança para a vida inteira. Por isso a Carta Mágica usa o que você conta no formulário para escrever um texto único:"),
            ("ul", [
                "<b>Nome e idade</b>: o Papai Noel chama a criança pelo nome várias vezes ao longo da carta.",
                "<b>Cidade</b>: ele conta que espiou a cidade dela lá do Polo Norte.",
                "<b>Conquistas do ano</b>: aprender a ler, passar de ano, largar a chupeta, ajudar em casa. Cada conquista é citada com carinho.",
                "<b>Pedido de Natal</b>: anotado no Grande Livro Dourado, sem prometer nada (assim ninguém fica numa saia justa).",
                "<b>Recado dos pais</b>: um “te amamos” que entra na carta de um jeito delicado.",
                "<b>Missão secreta de Natal</b>: uma pequena tarefa gentil para a criança cumprir até o dia 24.",
            ]),
            ("h2", "Veja um trecho de exemplo"),
            ("carta", [
                "Ho Ho Ho! Olá, Pedro, meu ajudante favorito de São Paulo!",
                "Hoje de manhã, quando os duendes entregaram a pilha de cartas, a sua estava brilhando tanto que a Mamãe Noel precisou colocar óculos escuros!",
                "Abri o Grande Livro Dourado na sua página e li, com o coração cheio de orgulho, que neste ano você aprendeu matemática, foi obediente e passou de ano na escola!",
                "🎯 Missão secreta de Natal: faça um desenho para o Papai Noel e deixe na janela na noite de Natal.",
            ]),
            ("h2", "Como criar a carta em 3 passos"),
            ("ol", [
                "Clique em <b>Criar minha carta grátis</b> e preencha nome, idade, cidade e as conquistas do ano.",
                "Escolha a cor da carta (clássica, rosa, lilás, azul ou verde) e o jeito do texto: mágico, emocionante, engraçado ou aventura.",
                "Pronto: a carta chega num envelope animado. Dá para ouvir a voz do Papai Noel, mandar no WhatsApp e baixar em PDF para imprimir.",
            ]),
            ("cta", ("Criar a carta do meu filho grátis", "/#criar")),
            ("h2", "Grátis ou Natal Completo?"),
            ("p", "A carta grátis já vem personalizada e você pode criar até 3 por dia. No <b>Natal Completo</b> (pagamento único a partir de R$ 14,90) a carta fica mais longa e caprichada, com <b>6 vozes</b> lendo a carta inteira, PDF e imagem em alta qualidade, certificado de bom comportamento e as 24 surpresas do Calendário do Advento. O plano de R$ 14,90 vale para até 2 crianças (10 cartas) e o Pacote Família, de R$ 25,90, para até 5 crianças (23 cartas)."),
            ("dica", "Dica: leia a carta junto com a criança na véspera de Natal, com as luzes da árvore acesas. Depois guarde o PDF impresso numa caixinha de lembranças."),
        ],
        "faq": [
            ("A carta do Papai Noel personalizada é grátis?", "Sim. Você cria e vê a carta completa sem pagar nada, até 3 cartas por dia. O Natal Completo é opcional."),
            ("Quanto tempo demora para ficar pronta?", "Menos de 2 minutos. Os duendes da oficina escrevem enquanto você assiste."),
            ("Posso imprimir a carta?", "Pode. A carta sai numa folha A4 com moldura, selo do Polo Norte e um QR code para ouvir a voz do Papai Noel."),
            ("Os dados do meu filho ficam seguros?", "Pedimos só o primeiro nome, a idade e a cidade. Não pedimos sobrenome, escola nem endereço, e a foto (quando usada) fica só no seu aparelho."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-gratis",
        "title": "Carta do Papai Noel Grátis Online para Crianças",
        "desc": "Faça uma carta do Papai Noel grátis, personalizada com o nome do seu filho, em menos de 2 minutos. Sem cadastro, com envelope animado e prévia da voz do Papai Noel.",
        "h1": "Carta do Papai Noel grátis, pronta em 2 minutos",
        "lead": "Sem cadastro e sem cartão: você escreve o nome da criança, conta o que ela conquistou neste ano e recebe uma carta do Papai Noel feita só para ela.",
        "emoji": "🎁",
        "blocks": [
            ("h2", "O que vem na carta grátis"),
            ("ul", [
                "Texto personalizado com o nome, a idade, a cidade e as conquistas da criança.",
                "Envelope animado que a criança abre com um toque.",
                "Carta brilhante em 5 cores, para a criança escolher a preferida.",
                "Prévia da voz do Papai Noel lendo o começo da carta.",
                "Link para mandar no WhatsApp para os avós e padrinhos.",
                "Até 3 cartas grátis por dia neste aparelho.",
            ]),
            ("h2", "Por que é grátis?"),
            ("p", "Porque queremos que toda criança possa receber uma carta do Papai Noel. A carta grátis é completa e emocionante. Quem quiser mais magia pode liberar o <b>Natal Completo</b>, com a voz do Papai Noel lendo a carta inteira, PDF, certificado e calendário do advento."),
            ("h2", "O que escrever para a carta ficar linda"),
            ("p", "Quanto mais detalhes, mais a criança se reconhece. Alguns exemplos que funcionam muito bem no campo de conquistas:"),
            ("ul", [
                "“Aprendeu a ler sozinho e lê historinhas para a irmã.”",
                "“Largou a fralda e agora dorme no próprio quarto.”",
                "“Passou de ano e ajudou a vovó quando ela ficou doente.”",
                "“Fez um amigo novo na escola e aprendeu a nadar.”",
            ]),
            ("p", "Em “Deixe a carta ainda mais especial” dá para contar o nome do bichinho, do melhor amigo e a comida favorita. O Papai Noel cita tudo de um jeito divertido."),
            ("cta", ("Fazer a carta grátis agora", "/#criar")),
        ],
        "faq": [
            ("Precisa fazer cadastro?", "Não. É só preencher o formulário e a carta aparece na hora."),
            ("Quantas cartas grátis posso fazer?", "Até 3 por dia em cada aparelho. Para fazer mais cartas completas, existe o Natal Completo."),
            ("Funciona no celular?", "Sim, o site foi feito para o celular. A criança abre o envelope tocando na tela."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-imprimir",
        "title": "Carta do Papai Noel para Imprimir (PDF Personalizado)",
        "desc": "Baixe uma carta do Papai Noel para imprimir em PDF, personalizada com o nome da criança, moldura dourada, selo do Polo Norte e QR code com a voz do Papai Noel.",
        "h1": "Carta do Papai Noel para imprimir, em PDF e com o nome da criança",
        "lead": "Uma carta de papel tem outro encanto: dá para colocar no envelope, deixar embaixo da árvore e guardar para sempre. A Carta Mágica gera um PDF caprichado, pronto para imprimir em casa.",
        "emoji": "🖨️",
        "blocks": [
            ("h2", "Como é a folha impressa"),
            ("ul", [
                "Folha A4 com moldura dupla e azevinho nos cantos.",
                "Cabeçalho “Correio Real do Polo Norte” com a data e o nome da criança.",
                "Texto com letra elegante e fácil de ler, saudação natalina e a Missão secreta num cartão colorido.",
                "Assinatura do Papai Noel e selo de cera do Polo Norte.",
                "QR code: a criança aponta o celular e ouve o Papai Noel lendo a carta.",
                "Na cor que a criança escolheu: clássica, rosa, lilás, azul ou verde.",
            ]),
            ("h2", "Dicas para a impressão ficar perfeita"),
            ("ol", [
                "Use papel um pouco mais grosso (120 g ou papel vergê), que deixa a carta com cara de documento oficial.",
                "Na janela de impressão, deixe a escala em 100% e ative “gráficos de fundo” para sair com as cores.",
                "Dobre em três, coloque num envelope vermelho e feche com um adesivo dourado.",
                "Deixe na árvore, na meia ou entregue “pelo correio” com a ajuda de um vizinho.",
            ]),
            ("dica", "Ideia que as crianças amam: na manhã de Natal, espalhe um pouco de farinha perto da janela, como se fossem pegadas de neve das renas, e deixe a carta ali."),
            ("cta", ("Criar e baixar a carta em PDF", "/#criar")),
            ("p", "O PDF e a imagem em alta qualidade fazem parte do <b>Natal Completo</b>. Na carta grátis você também pode usar o botão Imprimir do próprio site."),
        ],
        "faq": [
            ("Qual o tamanho da folha?", "A4 (21 × 29,7 cm), o papel comum das impressoras de casa."),
            ("Posso imprimir mais de uma vez?", "Pode imprimir quantas vezes quiser, inclusive para os avós."),
            ("Dá para imprimir colorido em gráfica?", "Sim. O arquivo tem boa resolução e funciona bem em gráficas rápidas."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-com-voz",
        "title": "Carta do Papai Noel com Voz: Ele Lê a Carta para seu Filho",
        "desc": "O Papai Noel lê em voz alta a carta personalizada do seu filho, chamando ele pelo nome. Escolha entre 6 vozes: Papai Noel, Mamãe Noel, Duende, Anjinho e mais.",
        "h1": "Carta do Papai Noel com a voz dele lendo para o seu filho",
        "lead": "Ler é lindo, mas ouvir o próprio Papai Noel falando o seu nome é mágico. Na Carta Mágica a carta é lida em voz alta, com sininhos de trenó e o texto acendendo junto com a voz.",
        "emoji": "🔔",
        "blocks": [
            ("h2", "Seis vozes para escolher"),
            ("ul", [
                "🎅 <b>Papai Noel</b>: voz grave, calma e acolhedora.",
                "🎉 <b>Noel animado</b>: mais risonho, perfeito para as crianças menores.",
                "🤶 <b>Mamãe Noel</b>: doce e carinhosa.",
                "🧝 <b>Duende</b>: divertido e cheio de energia.",
                "📖 <b>Contador de histórias</b>: para quem ama a hora de dormir.",
                "👼 <b>Anjinho do Natal</b>: suave, ideal para mensagens emocionantes.",
            ]),
            ("h2", "Como funciona"),
            ("p", "Depois que a carta abre, é só tocar em <b>Ouvir</b>. O parágrafo que está sendo lido fica destacado, então a criança acompanha a leitura. Na carta grátis você ouve uma prévia; no Natal Completo o Papai Noel lê a carta inteira em qualquer uma das 6 vozes, e você ainda pode baixar um vídeo com a voz para mandar no WhatsApp."),
            ("h2", "Ideias para usar a voz"),
            ("ul", [
                "Coloque a carta para tocar na TV na noite de Natal, com toda a família reunida.",
                "Mande o vídeo para os avós que moram longe.",
                "Use a leitura na hora de dormir durante o mês de dezembro.",
                "Imprima o PDF: o QR code da folha abre a voz no celular.",
            ]),
            ("cta", ("Ouvir o Papai Noel falando o nome do meu filho", "/#criar")),
        ],
        "faq": [
            ("A voz fala mesmo o nome da criança?", "Sim. A voz lê o texto da carta, que é escrito com o nome, a idade e as conquistas do seu filho."),
            ("Funciona sem internet?", "Para gerar a voz é preciso internet. Depois de baixar o vídeo, ele toca em qualquer lugar."),
            ("Quantas vozes tem na carta grátis?", "A grátis tem a prévia com a voz do Papai Noel. As 6 vozes completas vêm no Natal Completo."),
        ],
    },
    {
        "slug": "certificado-de-bom-comportamento",
        "title": "Certificado de Bom Comportamento do Papai Noel para Imprimir",
        "desc": "Certificado oficial de Bom Comportamento assinado pelo Papai Noel, com o nome da criança e selo do Polo Norte. Faça o teste da Lista do Bom Comportamento e imprima.",
        "h1": "Certificado de Bom Comportamento assinado pelo Papai Noel",
        "lead": "Toda criança adora ser reconhecida. O certificado do Polo Norte confirma, com selo e assinatura, que ela está na Lista do Bom Comportamento deste ano.",
        "emoji": "📜",
        "blocks": [
            ("h2", "Como a criança ganha o certificado"),
            ("ol", [
                "Ela responde ao teste divertido da <b>Lista do Bom Comportamento</b>, com perguntas sobre gentileza, ajuda em casa e amizade.",
                "Os duendes conferem tudo no Grande Livro Dourado.",
                "Aparece o resultado com o nome dela, pronto para salvar e compartilhar.",
            ]),
            ("p", "No Natal Completo, a carta do Papai Noel também vem acompanhada do certificado em alta qualidade para imprimir e emoldurar."),
            ("h2", "Use o certificado para incentivar, nunca para ameaçar"),
            ("p", "Em vez de “se não obedecer, não ganha presente”, transforme o certificado num reconhecimento: ele celebra o que a criança já faz de bom. Funciona muito melhor e deixa o Natal mais leve para todo mundo."),
            ("ul", [
                "Combine pequenas missões da semana: arrumar os brinquedos, ajudar a pôr a mesa, dividir com o irmão.",
                "Entregue o certificado numa “cerimônia” em família, com aplausos.",
                "Cole na geladeira ou no quarto, junto com a carta do Papai Noel.",
            ]),
            ("cta", ("Fazer o teste da Lista do Bom Comportamento", "/#lista")),
        ],
        "faq": [
            ("O certificado é grátis?", "O teste e o resultado são grátis. O certificado em alta qualidade para imprimir faz parte do Natal Completo."),
            ("Para qual idade é indicado?", "Para crianças de 3 a 10 anos, mas os irmãos mais velhos costumam querer o deles também."),
        ],
    },
    {
        "slug": "calendario-do-advento-infantil",
        "title": "Calendário do Advento Infantil Online: 24 Surpresas até o Natal",
        "desc": "Calendário do Advento online para crianças: uma portinha por dia de 1 a 24 de dezembro, com jogos, curiosidades, receitas, charadas e mensagens do Papai Noel.",
        "h1": "Calendário do Advento infantil: uma surpresa por dia até o Natal",
        "lead": "A contagem regressiva mais esperada do ano. De 1 a 24 de dezembro, a criança abre uma portinha por dia e encontra uma surpresa diferente.",
        "emoji": "📅",
        "blocks": [
            ("h2", "O que tem atrás das portinhas"),
            ("ul", [
                "Charadas e adivinhas de Natal.",
                "Curiosidades sobre como o Natal é comemorado pelo mundo.",
                "Receitas fáceis para fazer com as crianças, como biscoitos e chocolate quente.",
                "Brincadeiras e desafios para a família.",
                "Recadinhos do Papai Noel e dos duendes.",
            ]),
            ("h2", "Como usar o calendário em família"),
            ("p", "Escolha um momento fixo do dia para abrir a portinha, como depois do café da manhã ou antes de dormir. As portinhas só abrem no dia certo, o que ajuda a criança a entender a passagem do tempo e deixa a espera mais gostosa."),
            ("dica", "O progresso fica salvo no aparelho. Com o código mágico do Natal Completo, dá para continuar em outro celular ou tablet."),
            ("p", "As primeiras portinhas são grátis. As <b>24 surpresas completas</b> fazem parte do Natal Completo."),
            ("cta", ("Abrir o Calendário do Advento", "/#calendario")),
        ],
        "faq": [
            ("Posso abrir as portinhas antes do dia?", "Não, cada portinha abre no seu dia, como num calendário de verdade."),
            ("Se eu começar no meio de dezembro, perco os dias anteriores?", "Não. Os dias que já passaram ficam disponíveis para abrir."),
        ],
    },
    {
        "slug": "jogos-de-natal-para-criancas",
        "title": "Jogos de Natal para Crianças Online Grátis (para jogar em família)",
        "desc": "Jogos de Natal online e grátis para crianças: jogo da memória, Papai Noel, urso polar, Árvore de Natal da família e desenhos para colorir.",
        "h1": "Jogos de Natal para crianças, para jogar em família",
        "lead": "Além da carta do Papai Noel, a Carta Mágica tem uma vila inteira de brincadeiras de Natal. Todas funcionam no celular, sem instalar nada.",
        "emoji": "🎮",
        "blocks": [
            ("h2", "🎄 Árvore de Natal da Família"),
            ("p", "Cada enfeite guarda uma frase de carinho, gratidão ou um desejo para o ano novo. No Modo Ceia, as frases aparecem na TV na noite de Natal. <a href=\"/#arvore\">Montar a árvore</a>."),
            ("h2", "🃏 Memória de Natal"),
            ("p", "O clássico jogo da memória com figuras natalinas, em três níveis de dificuldade. Ótimo para treinar a atenção. <a href=\"/#memoria\">Jogar</a>."),
            ("h2", "🎅 Jogo do Papai Noel e 🐻‍❄️ Escorrega do Urso Polar"),
            ("p", "Jogos rápidos e divertidos para passar o tempo enquanto a ceia fica pronta. <a href=\"/#jogo\">Jogar</a>."),
            ("h2", "🎨 Ateliê de Natal"),
            ("p", "Desenhos de Natal para colorir na tela ou imprimir. <a href=\"/#atelie\">Colorir</a>."),
            ("h2", "🛷 Rastreie o Papai Noel"),
            ("p", "Acompanhe a viagem do trenó pelo mundo na noite de Natal. <a href=\"/#rastreador\">Ver o trenó</a>."),
            ("cta", ("Ver todas as brincadeiras", "/#jogo")),
        ],
        "faq": [
            ("Os jogos são grátis?", "Sim, todos têm uma parte grátis. O Natal Completo libera itens especiais e mais recursos."),
            ("Precisa baixar aplicativo?", "Não. Tudo funciona no navegador do celular, tablet ou computador."),
            ("Qual a idade indicada?", "Entre 3 e 10 anos, sempre com um adulto por perto. Muitos jogos são feitos para brincar em família."),
        ],
    },
    {
        "slug": "mensagem-do-papai-noel-para-criancas",
        "title": "Mensagem do Papai Noel para Crianças: 12 Exemplos Prontos",
        "desc": "Exemplos de mensagens do Papai Noel para crianças, para escrever no cartão, no bilhete da árvore ou mandar no WhatsApp. Ou crie uma carta personalizada com o nome do seu filho.",
        "h1": "Mensagem do Papai Noel para crianças: exemplos prontos",
        "lead": "Precisa de um bilhetinho do Papai Noel para deixar junto do presente? Separamos mensagens curtas para copiar. E, se quiser algo feito só para o seu filho, a Carta Mágica escreve uma carta inteira com o nome dele.",
        "emoji": "✨",
        "blocks": [
            ("h2", "Mensagens curtas para o bilhete do presente"),
            ("ul", [
                "“Ho Ho Ho! Os duendes contaram que você foi muito gentil este ano. Feliz Natal! — Papai Noel”",
                "“Passei pela sua casa e vi que a sua árvore é a mais bonita da rua. Com carinho, Papai Noel.”",
                "“Obrigado pelos biscoitos! As renas adoraram as cenouras. Até o ano que vem!”",
                "“Continue espalhando sorrisos por onde passar. O mundo fica mais bonito com você.”",
                "“Você está no Grande Livro Dourado! Que orgulho, meu ajudante favorito.”",
                "“Cuide bem do seu presente e lembre de dividir a alegria com quem você ama.”",
            ]),
            ("h2", "Mensagens para quem está aprendendo algo novo"),
            ("ul", [
                "“Fiquei sabendo que você aprendeu a ler. Agora pode ler as minhas cartas sozinho!”",
                "“Andar de bicicleta sem rodinhas? Até as renas ficaram impressionadas!”",
                "“Parabéns por passar de ano. Os duendes fizeram uma festa na oficina!”",
            ]),
            ("h2", "Mensagens de incentivo carinhoso"),
            ("ul", [
                "“Missão secreta: dar um abraço surpresa em alguém da família todos os dias até o Natal.”",
                "“Que tal ajudar a arrumar a mesa da ceia? Os duendes adoram ajudantes!”",
                "“Dormir no seu quartinho é coisa de criança corajosa. Estou torcendo por você!”",
            ]),
            ("dica", "Evite mensagens com ameaça (“se não obedecer, não ganha presente”). O Papai Noel é pura bondade, e o incentivo positivo funciona muito melhor."),
            ("h2", "Quer uma carta inteira, com o nome do seu filho?"),
            ("p", "Na Carta Mágica você conta as conquistas do ano e o Papai Noel escreve uma carta só para a criança, com saudação, missão secreta e P.S. engraçado. Dá para ouvir a voz dele e imprimir."),
            ("cta", ("Criar a carta personalizada grátis", "/#criar")),
        ],
        "faq": [
            ("Posso copiar essas mensagens?", "Claro! Use à vontade nos cartões e bilhetes da sua família."),
            ("Como fazer a letra parecer do Papai Noel?", "Escreva com caneta dourada ou vermelha, com letra inclinada. Ou imprima a carta da Carta Mágica, que já vem com assinatura e selo."),
        ],
    },
    {
        "slug": "como-fazer-o-natal-magico-para-criancas",
        "title": "Como Fazer o Natal Mágico para as Crianças: 15 Ideias Simples",
        "desc": "Ideias simples para deixar o Natal mágico para as crianças: carta do Papai Noel, pegadas das renas, calendário do advento, árvore da família, ceia e tradições em família.",
        "h1": "Como fazer o Natal mágico para as crianças: 15 ideias simples",
        "lead": "A magia do Natal não está no tamanho do presente, e sim nos pequenos rituais que a família cria junto. Separamos ideias fáceis, baratas e que as crianças lembram para sempre.",
        "emoji": "🌟",
        "blocks": [
            ("h2", "Antes do Natal"),
            ("ol", [
                "<b>Carta do Papai Noel com o nome da criança</b>: chega num envelope e cita as conquistas do ano. <a href=\"/carta-do-papai-noel-personalizada\">Veja como criar</a>.",
                "<b>Calendário do Advento</b>: uma surpresa por dia de 1 a 24 de dezembro. <a href=\"/calendario-do-advento-infantil\">Conheça</a>.",
                "<b>Montar a árvore juntos</b>, deixando a criança colocar a estrela no topo.",
                "<b>Árvore de frases</b>: cada pessoa da família pendura um enfeite com uma frase de carinho.",
                "<b>Missões secretas</b>: pequenas gentilezas para cumprir até o Natal.",
                "<b>Biscoitos de Natal</b>: bagunça na cozinha garantida e lembranças deliciosas.",
                "<b>Doar um brinquedo</b>: ensina que o Natal também é sobre compartilhar.",
            ]),
            ("h2", "Na véspera"),
            ("ol", [
                "<b>Rastrear o trenó</b> do Papai Noel pelo mundo.",
                "<b>Ler a carta do Papai Noel</b> em voz alta, com a voz dele tocando na TV.",
                "<b>Leite e biscoitos</b> para o Papai Noel e cenouras para as renas na janela.",
                "<b>Pijama de Natal</b> igual para a família toda.",
                "<b>Montar a Árvore da Família</b> no celular com os avós que estão longe.",
            ]),
            ("h2", "Na manhã de Natal"),
            ("ol", [
                "<b>Pegadas de neve</b> feitas com farinha e uma botina, da janela até a árvore.",
                "<b>Bilhete de agradecimento</b> do Papai Noel no lugar dos biscoitos.",
                "<b>Certificado de Bom Comportamento</b> entregue numa pequena cerimônia.",
            ]),
            ("cta", ("Começar pela carta do Papai Noel", "/#criar")),
        ],
        "faq": [
            ("Com que idade as crianças aproveitam mais?", "Entre 3 e 9 anos a magia é mais forte, mas os rituais em família encantam todas as idades."),
            ("Dá para fazer tudo isso gastando pouco?", "Sim. A maioria das ideias custa quase nada, e a carta do Papai Noel e os jogos da Carta Mágica têm versão grátis."),
        ],
    },
]

PAGES += [
    {
        "slug": "papel-timbrado-carta-papai-noel",
        "title": "Papel Timbrado do Papai Noel para Imprimir Grátis (PDF) + Resposta",
        "desc": "Baixe grátis o papel timbrado do Correio do Polo Norte em PDF. A criança escreve a carta à mão, você fotografa e o Papai Noel responde com o nome dela, respondendo às perguntas.",
        "h1": "Papel timbrado do Papai Noel para imprimir grátis",
        "lead": "Uma folha oficial do Correio do Polo Norte, com linhas para escrever, espaço para desenhar e selo. Depois de pronta, é só fotografar: o Papai Noel lê e responde.",
        "emoji": "📮",
        "blocks": [
            ("cta", ("Baixar o papel timbrado (PDF grátis)", "/papel-timbrado-polo-norte.pdf")),
            ("h2", "O que vem na folha"),
            ("ul", [
                "Cabeçalho “Correio Oficial do Polo Norte” com selo e azevinhos.",
                "“Querido Papai Noel, eu me chamo ______” para a criança completar.",
                "9 linhas pautadas para escrever e um quadro para o desenho.",
                "Espaço para assinar e as 3 instruções: escrever, desenhar e pedir para um adulto fotografar.",
                "Tamanho A4, pronto para imprimir em casa, em preto e branco ou colorido.",
            ]),
            ("h2", "E depois que a criança escreve?"),
            ("ol", [
                "Tire uma foto da folha inteira, com luz e sem sombra.",
                "No site, toque em <b>Enviar a cartinha</b>, preencha nome, idade e cidade e envie a foto.",
                "O Polo Norte lê a letra dela (até com os errinhos) e entrega um número de protocolo: “Sua carta é a nº 12.384”.",
                "Você vê a resposta do Papai Noel antes e escolhe quando ela chega: agora, em 3 dias, na véspera ou na manhã de Natal.",
            ]),
            ("cta", ("Enviar a cartinha do meu filho", "/#enviar-cartinha")),
            ("h2", "O que o Papai Noel responde"),
            ("ul", [
                "Cita o que a criança escreveu e desenhou, com carinho.",
                "Responde cada pergunta (“as renas comem cenoura?”). É o que mais encanta.",
                "Comenta os pedidos dizendo que anotou no Grande Livro Dourado, sem prometer presentes.",
                "Nunca corrige a letra ou a ortografia: só elogia o capricho.",
                "Cartinhas com temas delicados recebem uma resposta acolhedora e passam por revisão humana antes de sair.",
            ]),
            ("dica", "Para os pais: você recebe a lista do que seu filho pediu e um PDF de lembrança com a cartinha dele e a resposta, para guardar como “Natal 2026”."),
        ],
        "faq": [
            ("O papel timbrado é grátis mesmo?", "Sim, é só baixar e imprimir quantas vezes quiser."),
            ("A foto da cartinha fica guardada?", "Não. A foto é lida na hora para escrever a resposta e não é armazenada. Fica só o texto que o Polo Norte leu."),
            ("Meu filho ainda não escreve. E agora?", "Ele dita e você digita no site, ou desenha e você escreve embaixo. O Papai Noel responde do mesmo jeito."),
            ("Quanto custa a resposta?", "A prévia é grátis. A resposta completa, com a voz do Papai Noel e o PDF, faz parte do Natal Completo: R$ 14,90 para até 2 crianças ou R$ 25,90 no Pacote Família."),
        ],
    },
    {
        "slug": "resposta-da-carta-do-papai-noel",
        "title": "Resposta da Carta do Papai Noel: Como Responder a Cartinha do seu Filho",
        "desc": "Seu filho escreveu para o Papai Noel? Veja como responder a cartinha de um jeito mágico, com o nome dele, as conquistas do ano e a voz do Papai Noel lendo a resposta.",
        "h1": "Resposta da carta do Papai Noel: como responder a cartinha do seu filho",
        "lead": "A criança escreveu, colocou no envelope e entregou com todo o cuidado. Agora ela espera a resposta. Veja como transformar esse momento numa lembrança inesquecível.",
        "emoji": "📮",
        "blocks": [
            ("h2", "Por que responder a cartinha faz tanta diferença"),
            ("p", "Quando a resposta chega, a criança sente que foi ouvida. Ela percebe que o esforço de escrever valeu a pena, treina a leitura com vontade e guarda aquele papel por anos. Uma resposta genérica não tem esse efeito; a mágica está nos detalhes que só o Papai Noel “poderia saber”."),
            ("h2", "O que a resposta precisa ter"),
            ("ul", [
                "<b>O nome da criança</b>, várias vezes, e a cidade onde ela mora.",
                "<b>Algo que ela escreveu na cartinha</b>: o pedido, um desenho, uma pergunta sobre as renas.",
                "<b>Um elogio concreto</b> do ano: aprendeu a ler, passou de ano, ajudou em casa.",
                "<b>Nenhuma promessa</b> de presente: o Papai Noel diz que anotou o pedido no Grande Livro Dourado.",
                "<b>Um toque de humor</b>: as renas, os duendes, a Mamãe Noel fazendo biscoitos.",
                "<b>Uma pequena missão</b> para cumprir até o Natal.",
            ]),
            ("h2", "Como fazer em 2 minutos"),
            ("ol", [
                "Leia a cartinha do seu filho e anote o pedido e o que mais chamou a atenção.",
                "Na Carta Mágica, clique em <b>Criar minha carta grátis</b> e preencha nome, idade, cidade, conquistas e o pedido.",
                "Em “Deixe a carta ainda mais especial”, conte o nome do bichinho, do melhor amigo e a brincadeira favorita.",
                "Pronto: a resposta chega num envelope animado, com a voz do Papai Noel e o PDF para imprimir.",
            ]),
            ("cta", ("Enviar a cartinha e receber a resposta", "/#enviar-cartinha")),
            ("h2", "Como entregar a resposta"),
            ("ul", [
                "Imprima e coloque no mesmo lugar onde a cartinha foi deixada (na meia, na janela ou embaixo da árvore).",
                "Feche o envelope com um adesivo dourado e escreva “Correio do Polo Norte”.",
                "Use o QR code da folha para a criança ouvir o Papai Noel lendo a resposta.",
            ]),
            ("dica", "Guarde a cartinha original junto com a resposta numa pasta. Daqui a alguns anos, ela vira uma das lembranças mais bonitas da infância."),
        ],
        "faq": [
            ("Quanto tempo depois devo entregar a resposta?", "Entre 3 e 10 dias funciona bem: dá tempo de a carta “viajar” até o Polo Norte e voltar."),
            ("E se a criança pediu um presente que não vai ganhar?", "A carta não promete nada. O Papai Noel diz que anotou o pedido com carinho, sem compromisso."),
            ("Posso responder cartinhas de vários filhos?", "Sim. No Natal Completo, o plano de R$ 14,90 cobre até 2 crianças e o Pacote Família até 5."),
        ],
    },
    {
        "slug": "como-escrever-uma-carta-para-o-papai-noel",
        "title": "Como Escrever uma Carta para o Papai Noel (Passo a Passo para Crianças)",
        "desc": "Passo a passo simples para a criança escrever a carta para o Papai Noel: como começar, o que contar, como pedir o presente e como terminar. Com exemplo pronto.",
        "h1": "Como escrever uma carta para o Papai Noel: passo a passo para crianças",
        "lead": "Escrever para o Papai Noel é uma das tradições mais gostosas do Natal. E ainda ajuda a criança a treinar a escrita. Veja um roteiro simples para fazer junto com ela.",
        "emoji": "✏️",
        "blocks": [
            ("h2", "Passo a passo"),
            ("ol", [
                "<b>Comece cumprimentando</b>: “Querido Papai Noel,” ou “Olá, Papai Noel!”.",
                "<b>Apresente-se</b>: nome, idade e cidade. (“Eu sou a Sofia, tenho 6 anos e moro em Recife.”)",
                "<b>Conte como foi o ano</b>: o que aprendeu, do que se orgulha, um momento feliz.",
                "<b>Pergunte algo ao Papai Noel</b>: como estão as renas? A Mamãe Noel faz biscoito?",
                "<b>Faça o pedido</b> com educação. Vale pedir algo para outra pessoa também.",
                "<b>Agradeça e se despeça</b>: “Obrigada, Papai Noel! Um abraço, Sofia.”",
                "<b>Capriche no visual</b>: desenhos, adesivos e um envelope bem bonito.",
            ]),
            ("h2", "Exemplo de carta escrita por uma criança"),
            ("carta", [
                "Querido Papai Noel,",
                "Eu sou o Miguel, tenho 7 anos e moro em Curitiba. Este ano eu aprendi a andar de bicicleta e ajudei a cuidar do meu cachorro Thor.",
                "Como estão as renas? Elas sentem frio? Eu queria ganhar um kit de pintura, e queria que a minha avó ficasse sempre bem.",
                "Obrigado por tudo! Vou deixar biscoitos na janela.",
            ]),
            ("h2", "Dicas para os pais"),
            ("ul", [
                "Para quem ainda não escreve, deixe a criança ditar e escreva por ela. Ela pode desenhar e assinar.",
                "Não corrija tudo: os errinhos fazem parte do encanto.",
                "Tire uma foto da carta antes de “enviar”. Ela vai virar lembrança.",
                "Use o que a criança escreveu para preparar a resposta do Papai Noel.",
            ]),
            ("h2", "E a resposta do Papai Noel?"),
            ("p", "Com o que a criança contou na cartinha, você cria a resposta na Carta Mágica: o Papai Noel cita o nome, as conquistas e o pedido, e ainda lê a carta em voz alta. <a href=\"/resposta-da-carta-do-papai-noel\">Veja como responder a cartinha</a>."),
            ("cta", ("Enviar a cartinha e receber a resposta", "/#enviar-cartinha")),
        ],
        "faq": [
            ("Com que idade a criança pode escrever a carta?", "A partir dos 3 anos ela já participa ditando e desenhando. Dos 6 anos em diante costuma escrever sozinha."),
            ("Onde deixar a carta?", "Na janela, na meia, embaixo da árvore ou num envelope “para o Polo Norte”. O importante é o ritual."),
        ],
    },
    {
        "slug": "modelo-de-carta-para-o-papai-noel",
        "title": "Modelo de Carta para o Papai Noel para a Criança Preencher",
        "desc": "Modelo de carta para o Papai Noel com espaços para a criança preencher: nome, idade, conquistas do ano, pedido e desenho. Copie, imprima e brinque em família.",
        "h1": "Modelo de carta para o Papai Noel (para a criança preencher)",
        "lead": "Um modelo com espaços em branco ajuda as crianças menores a escreverem sozinhas. Copie o texto abaixo, imprima e deixe a criança completar e desenhar.",
        "emoji": "📝",
        "blocks": [
            ("h2", "Modelo para copiar"),
            ("carta", [
                "Querido Papai Noel,",
                "Meu nome é ______________ e eu tenho ____ anos. Eu moro em ______________.",
                "Este ano eu aprendi a ______________ e fiquei muito feliz quando ______________.",
                "Eu ajudei a minha família ______________.",
                "Neste Natal eu gostaria de ganhar ______________. E queria pedir também ______________ para ______________.",
                "Um beijo e um abraço bem apertado de ______________.",
            ]),
            ("h2", "Ideias para completar os espaços"),
            ("ul", [
                "<b>Aprendi a</b>: ler, nadar, amarrar o tênis, andar de bicicleta, dormir no meu quarto.",
                "<b>Fiquei feliz quando</b>: viajei com a família, ganhei um irmãozinho, fiz um amigo novo.",
                "<b>Ajudei</b>: a arrumar a mesa, a cuidar do cachorro, a guardar os brinquedos.",
                "<b>Pedido para outra pessoa</b>: saúde para a vovó, um emprego novo para o papai, alegria para os amigos.",
            ]),
            ("h2", "Depois de preencher"),
            ("p", "Peça para a criança desenhar na parte de baixo da folha: a árvore da casa, a família, as renas. Coloque num envelope e deixe para o Papai Noel “buscar”. Alguns dias depois, entregue a resposta personalizada, feita com o que ela escreveu."),
            ("cta", ("Enviar a cartinha do meu filho", "/#enviar-cartinha")),
            ("dica", "Quer mais atividades para imprimir? No <a href=\"/#atelie\">Ateliê de Natal</a> há desenhos de Natal para colorir."),
        ],
        "faq": [
            ("Posso imprimir o modelo?", "Sim. Copie o texto para o editor de textos do computador ou do celular e imprima em folha A4."),
            ("O modelo serve para quem ainda não sabe escrever?", "Serve: o adulto lê as frases, a criança fala e o adulto completa. Ela assina e desenha."),
        ],
    },
    {
        "slug": "video-do-papai-noel-personalizado",
        "title": "Vídeo do Papai Noel Personalizado com o Nome da Criança",
        "desc": "Vídeo do Papai Noel personalizado: a carta com o nome do seu filho lida pela voz do Papai Noel, pronta para mandar no WhatsApp e mostrar na TV na noite de Natal.",
        "h1": "Vídeo do Papai Noel personalizado com o nome do seu filho",
        "lead": "Na Carta Mágica, a carta personalizada vira um vídeo: a carta aparece na tela enquanto o Papai Noel lê em voz alta, chamando a criança pelo nome.",
        "emoji": "🎬",
        "blocks": [
            ("h2", "Como é o vídeo"),
            ("ul", [
                "A carta com o nome, a idade, a cidade e as conquistas da criança.",
                "A voz do Papai Noel (ou outra das 6 vozes) lendo do começo ao fim.",
                "O trecho que está sendo lido fica em destaque, para a criança acompanhar.",
                "Formato pronto para o WhatsApp e para o Status, e para a TV.",
            ]),
            ("h2", "Como criar o vídeo"),
            ("ol", [
                "Crie a carta grátis com os dados do seu filho.",
                "Libere o Natal Completo (a partir de R$ 14,90, pagamento único).",
                "Escolha a voz e toque em <b>Compartilhar e baixar → Vídeo com a voz</b>.",
            ]),
            ("cta", ("Criar a carta do meu filho", "/#criar")),
            ("h2", "Ideias para usar o vídeo"),
            ("ul", [
                "Coloque na TV na véspera de Natal, com as luzes apagadas e só a árvore acesa.",
                "Mande para os avós e padrinhos que moram longe.",
                "Mostre na manhã de Natal, junto com o bilhete do Papai Noel.",
                "Guarde no celular: daqui a alguns anos, vai ser emocionante rever.",
            ]),
        ],
        "faq": [
            ("O vídeo fala o nome da criança?", "Sim. A voz lê a carta, que é escrita com o nome e as conquistas do seu filho."),
            ("Posso fazer vídeo para mais de um filho?", "Pode. Cada carta gera o seu vídeo. O plano de R$ 14,90 cobre até 2 crianças e o Pacote Família até 5."),
            ("O vídeo funciona no celular?", "Sim, o vídeo é gerado no próprio celular e pode ser enviado no WhatsApp."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-bebe",
        "title": "Carta do Papai Noel para Bebê: o Primeiro Natal do seu Filho",
        "desc": "Carta do Papai Noel para o primeiro Natal do bebê, personalizada com o nome e as primeiras conquistas. Uma lembrança para guardar na caixinha de recordações.",
        "h1": "Carta do Papai Noel para o primeiro Natal do bebê",
        "lead": "O bebê ainda não entende, mas a família inteira se emociona. E daqui a alguns anos, ele vai adorar ler a carta que o Papai Noel escreveu no primeiro Natal dele.",
        "emoji": "👶",
        "blocks": [
            ("h2", "O que contar na carta do bebê"),
            ("ul", [
                "As primeiras conquistas: o primeiro sorriso, sentar sozinho, a primeira palavrinha, os primeiros passos.",
                "Quem é a família: papai, mamãe, irmãos, avós e até o cachorro.",
                "Um recado dos pais, que entra na carta com carinho.",
                "A data e a cidade: em poucos anos, cada detalhe vira lembrança.",
            ]),
            ("h2", "Ideias para guardar a carta"),
            ("ol", [
                "Imprima em papel mais grosso e guarde na caixinha do bebê, junto com a pulseirinha da maternidade.",
                "Coloque num álbum de fotos do primeiro Natal.",
                "Crie uma carta por ano: no 5º Natal, a criança vai ler todas e se emocionar.",
            ]),
            ("p", "Na Carta Mágica, a idade aceita é a partir de 0 anos. Escolha o jeito <b>Emocionante</b> para um texto mais delicado."),
            ("cta", ("Criar a carta do primeiro Natal", "/#criar")),
            ("dica", "Grave o vídeo com a voz do Papai Noel lendo a carta e mostre para o bebê na noite de Natal. As luzes e a voz costumam encantar até os pequenininhos."),
        ],
        "faq": [
            ("Dá para fazer carta para bebê de poucos meses?", "Sim, a carta aceita crianças a partir de 0 anos."),
            ("A carta para bebê é diferente?", "O texto se adapta ao que você conta: conquistas, família e recado dos pais. Escolha o tom Emocionante."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-irmaos",
        "title": "Carta do Papai Noel para Irmãos: uma Carta para Cada Filho",
        "desc": "Tem mais de um filho? Crie uma carta do Papai Noel para cada irmão, com o nome e as conquistas de cada um. Planos para até 2 ou até 5 crianças, com pagamento único.",
        "h1": "Carta do Papai Noel para irmãos: uma carta para cada filho",
        "lead": "Cada criança quer se sentir especial. Por isso o ideal é que cada irmão receba a sua própria carta, com o nome dele e o que ele conquistou neste ano.",
        "emoji": "👧👦",
        "blocks": [
            ("h2", "Uma carta para cada um (e os irmãos aparecem também)"),
            ("p", "Na Carta Mágica, cada carta é feita para uma criança. Em “Deixe a carta ainda mais especial”, você pode citar os irmãos: o Papai Noel manda um abraço para eles também, sem tirar o protagonismo de quem recebe a carta."),
            ("h2", "Planos para famílias"),
            ("ul", [
                "<b>Carta Completa (R$ 14,90)</b>: até 2 crianças e 10 cartas completas.",
                "<b>Pacote Família (R$ 25,90)</b>: até 5 crianças e 23 cartas completas.",
                "Comprou o de 2 e chegou mais um primo? Dá para virar Pacote Família pagando só a diferença.",
                "No <b>Painel da Família</b> você vê quantas cartas já fez e quantas faltam.",
            ]),
            ("h2", "Ideias para irmãos"),
            ("ul", [
                "Entregue as cartas ao mesmo tempo e deixe cada um ler (ou ouvir) a sua.",
                "Use uma cor diferente para cada criança: rosa, lilás, azul, verde ou clássica.",
                "Crie uma missão secreta para fazer em dupla: preparar um desenho juntos para o Papai Noel.",
                "Montem juntos a <a href=\"/#arvore\">Árvore da Família</a>, com um enfeite para cada irmão.",
            ]),
            ("cta", ("Criar as cartas dos meus filhos", "/#criar")),
        ],
        "faq": [
            ("Preciso pagar uma vez para cada filho?", "Não. O pagamento é único: o plano de R$ 14,90 cobre 2 crianças e o Pacote Família cobre 5."),
            ("Como uso o plano em outro celular?", "Com o código mágico que aparece depois do pagamento, ou entrando no Painel da Família."),
        ],
    },
    {
        "slug": "papai-noel-existe",
        "title": "Papai Noel Existe? Como Responder a Pergunta do seu Filho",
        "desc": "Seu filho perguntou se o Papai Noel existe? Veja formas carinhosas de responder em cada idade, sem quebrar a magia de repente e sem mentir.",
        "h1": "“Papai Noel existe?” Como responder a pergunta do seu filho",
        "lead": "Uma hora a pergunta chega, às vezes depois de um colega da escola dizer que não existe. Não há resposta certa para todas as famílias, mas há jeitos carinhosos de conduzir essa conversa.",
        "emoji": "🤔",
        "blocks": [
            ("h2", "Primeiro, devolva a pergunta"),
            ("p", "Pergunte com calma: “E você, o que acha?”. Muitas crianças querem só confirmar que ainda podem acreditar. Outras já descobriram e querem ouvir isso de você. A resposta dela mostra o caminho."),
            ("h2", "Se ela ainda quer acreditar"),
            ("ul", [
                "“O Papai Noel existe para quem acredita na magia do Natal.”",
                "“Cada família tem o seu jeito de viver o Natal, e o nosso tem Papai Noel.”",
                "Mantenha os rituais: a carta, os biscoitos na janela, o rastreador do trenó.",
            ]),
            ("h2", "Se ela já percebeu"),
            ("p", "Muitos pais transformam a descoberta numa promoção: a criança vira “ajudante do Papai Noel”. A partir daí, ela ajuda a manter a magia para os irmãos menores e entende que o Papai Noel é o espírito de generosidade que todos nós podemos ter."),
            ("ul", [
                "Conte que o Papai Noel se inspira em São Nicolau, que ajudava crianças em segredo.",
                "Convide a criança a ser o “Papai Noel secreto” de alguém da família.",
                "Deixe ela preparar a carta do Papai Noel para o irmão mais novo.",
            ]),
            ("h2", "O que evitar"),
            ("ul", [
                "Rir da pergunta ou tratar a criança como boba por ter acreditado.",
                "Usar o Papai Noel como ameaça (“se não obedecer, ele não vem”).",
                "Revelar tudo de repente para uma criança que claramente ainda quer acreditar.",
            ]),
            ("cta", ("Criar uma carta do Papai Noel", "/#criar")),
        ],
        "faq": [
            ("Com que idade as crianças param de acreditar?", "Em geral entre 7 e 9 anos, mas cada criança tem o seu tempo."),
            ("Contar sobre o Papai Noel é mentir para a criança?", "Muitas famílias veem como uma brincadeira de imaginação, parecida com os contos de fada. Cada família decide o que faz sentido para ela."),
        ],
    },
    {
        "slug": "brincadeiras-de-natal-em-familia",
        "title": "Brincadeiras de Natal em Família: 12 Ideias para a Ceia",
        "desc": "Brincadeiras de Natal para fazer em família na ceia: jogos com crianças, avós e primos, que não precisam de quase nada. Inclui opções online para quem está longe.",
        "h1": "Brincadeiras de Natal em família: 12 ideias para a ceia",
        "lead": "Enquanto a ceia não fica pronta, as crianças ficam ansiosas. Separamos brincadeiras que juntam todas as idades e quase não precisam de material.",
        "emoji": "🎲",
        "blocks": [
            ("h2", "Brincadeiras sem material"),
            ("ol", [
                "<b>Mímica de Natal</b>: cada um imita algo natalino (rena, presépio, Papai Noel descendo a chaminé) e os outros adivinham.",
                "<b>Música congelante</b>: quando a música de Natal para, todo mundo congela.",
                "<b>O que mudou na árvore?</b> Uma pessoa troca um enfeite de lugar e os outros descobrem qual.",
                "<b>Telefone sem fio natalino</b> com frases como “a rena do Polo Norte comeu o panetone”.",
            ]),
            ("h2", "Com papel e caneta"),
            ("ol", [
                "<b>Amigo secreto de elogios</b>: cada um escreve uma qualidade de quem tirou.",
                "<b>Desenho às cegas</b>: desenhar o Papai Noel de olhos fechados. Muitas risadas garantidas.",
                "<b>Caça ao tesouro</b> com pistas que levam ao último presente.",
                "<b>Bilhetes para a árvore</b>: cada um escreve um desejo para o ano que vem.",
            ]),
            ("h2", "No celular, com quem está longe"),
            ("ol", [
                "<b>Árvore de frases</b>: os avós penduram enfeites pelo link. <a href=\"/#arvore\">Montar</a>.",
                "<b>Rastrear o trenó</b> do Papai Noel. <a href=\"/#rastreador\">Ver</a>.",
                "<b>Memória de Natal</b> em duplas: adultos contra crianças. <a href=\"/#memoria\">Jogar</a>.",
            ]),
            ("cta", ("Ver as brincadeiras da Carta Mágica", "/jogos-de-natal-para-criancas")),
        ],
        "faq": [
            ("Quais brincadeiras funcionam com crianças pequenas?", "Música congelante, mímica com ajuda de um adulto e o jogo da memória são ótimos a partir de 3 anos."),
            ("Como incluir os avós que moram longe?", "A Árvore da Família funciona pelo link do WhatsApp: cada um pendura um enfeite do seu celular."),
        ],
    },
    {
        "slug": "historia-de-natal-para-criancas",
        "title": "História de Natal para Crianças: 2 Contos Curtos para Ler Antes de Dormir",
        "desc": "Duas histórias de Natal curtas e inéditas para ler para as crianças antes de dormir: a rena que tinha medo do escuro e o duende que esqueceu o próprio nome.",
        "h1": "História de Natal para crianças: 2 contos curtos para a hora de dormir",
        "lead": "Histórias curtinhas, para ler em 3 minutos, com uma mensagem gentil no final. Perfeitas para as noites de dezembro.",
        "emoji": "📖",
        "blocks": [
            ("h2", "1. A rena que tinha medo do escuro"),
            ("p", "No Polo Norte vivia uma renazinha chamada Faísca. Ela corria mais rápido que todas, mas tinha um segredo: morria de medo do escuro. E a noite de Natal é a noite mais escura do ano."),
            ("p", "Na véspera, Faísca contou o segredo para a Mamãe Noel. Em vez de rir, ela pegou um novelo de lã vermelha e amarrou um sininho no pescoço da renazinha. “Cada vez que você ouvir o sininho”, disse, “lembre que todas as outras renas estão bem do seu lado.”"),
            ("p", "Naquela noite, o trenó cruzou o céu. Estava escuro, sim. Mas a cada balanço, o sininho tocava, e Faísca lembrava que não estava sozinha. No fim da viagem, ela percebeu uma coisa: as estrelas só aparecem quando está escuro. E nunca tinha visto tantas."),
            ("dica", "Para conversar depois: do que você tem medo? Quem é o seu “sininho” que lembra que você não está sozinho?"),
            ("h2", "2. O duende que esqueceu o próprio nome"),
            ("p", "Pipo era o duende mais distraído da oficina. Um dia, de tanto pensar em presentes, esqueceu o próprio nome. Passou a manhã perguntando para todo mundo: “Você sabe como eu me chamo?”"),
            ("p", "Um duende lembrou: “Você é aquele que me ajudou a carregar as caixas!”. Outro disse: “Você é o que dividiu o chocolate quente comigo!”. A Mamãe Noel sorriu: “Você é o duende que faz todo mundo se sentir querido.”"),
            ("p", "No fim do dia, o Papai Noel chegou com o crachá dele: “PIPO”. Mas Pipo já não estava preocupado. Tinha descoberto que as pessoas lembram da gente pelo jeito que tratamos os outros."),
            ("dica", "Para conversar depois: como os seus amigos lembrariam de você?"),
            ("h2", "Quer uma história em que o seu filho é o personagem?"),
            ("p", "A carta da Carta Mágica é escrita para a criança, com o nome dela, e pode ser lida pela voz do <b>Contador de histórias</b>, uma das 6 vozes do Natal Completo."),
            ("cta", ("Criar a carta do meu filho", "/#criar")),
        ],
        "faq": [
            ("Posso ler essas histórias na escola?", "Pode, à vontade. Elas foram escritas para serem lidas em voz alta."),
            ("Para qual idade são indicadas?", "Entre 3 e 8 anos."),
        ],
    },
    {
        "slug": "receitas-de-natal-para-fazer-com-criancas",
        "title": "Receitas de Natal para Fazer com Crianças (Fáceis e sem Fogão)",
        "desc": "Receitas de Natal fáceis para fazer com as crianças: biscoito de Natal, chocolate quente, árvore de frutas e trufas sem fogão. Inclui os biscoitos para deixar para o Papai Noel.",
        "h1": "Receitas de Natal para fazer com crianças",
        "lead": "Cozinhar junto é uma das memórias mais gostosas do Natal. Escolhemos receitas simples, em que as crianças podem participar de verdade (com um adulto por perto).",
        "emoji": "🍪",
        "blocks": [
            ("h2", "Biscoitos para deixar para o Papai Noel"),
            ("ul", [
                "2 xícaras de farinha de trigo, 1/2 xícara de açúcar, 100 g de manteiga, 1 ovo e 1 colher (chá) de canela.",
                "Misture tudo com as mãos até virar uma massa lisa. As crianças adoram essa parte.",
                "Abra com o rolo e corte com forminhas de estrela, árvore e boneco.",
                "Asse a 180 °C por cerca de 12 minutos (essa parte é do adulto).",
                "Decore com glacê e confeitos coloridos.",
            ]),
            ("h2", "Chocolate quente da Mamãe Noel"),
            ("ul", [
                "2 xícaras de leite, 2 colheres de chocolate em pó, 1 colher de açúcar e uma pitada de canela.",
                "O adulto aquece; a criança mexe e coloca os marshmallows por cima.",
            ]),
            ("h2", "Árvore de Natal de frutas (sem fogão)"),
            ("ul", [
                "Use uma cenoura em pé como tronco e espete palitos com uvas verdes, morangos e kiwi em formato de árvore.",
                "Uma carambola em estrela vai no topo.",
            ]),
            ("h2", "Trufas de bolacha (sem fogão)"),
            ("ul", [
                "Triture 1 pacote de bolacha de chocolate e misture com 1/2 lata de leite condensado.",
                "Faça bolinhas e passe no confeito verde e vermelho.",
            ]),
            ("dica", "Deixe um prato com biscoitos e um copo de leite na janela na véspera. De manhã, deixe migalhas e um bilhete de agradecimento do Papai Noel."),
            ("h2", "Na cozinha com o Papai Noel"),
            ("p", "Quer que o Papai Noel agradeça os biscoitos com o nome do seu filho? Crie a carta e conte, nos detalhes, a comida favorita da criança: ele comenta no P.S."),
            ("cta", ("Criar a carta do Papai Noel", "/#criar")),
        ],
        "faq": [
            ("A partir de que idade a criança pode ajudar?", "A partir dos 3 anos ela já mistura, decora e monta. Forno e fogão ficam sempre com os adultos."),
            ("Tem opção sem glúten ou sem lactose?", "Dá para adaptar: troque a farinha por uma mistura sem glúten e a manteiga por uma versão vegetal."),
        ],
    },
]

# ------------------------------------------------------------------ 30 páginas novas (novembro de 2026)
CRIAR = ("cta", ("Criar a carta grátis agora", "/#criar"))
LIGAR = ("cta", ("Receber a ligação do Papai Noel", "/#ao-vivo"))

PAGES += [
    {
        "slug": "ligacao-do-papai-noel",
        "title": "Ligação do Papai Noel: Ele Fala o Nome do seu Filho",
        "desc": "Ligação do Papai Noel para crianças: ele fala o nome do seu filho, pergunta a idade, o que ele fez de bom e o pedido de Natal. Até 2 minutos, por R$ 5,90.",
        "h1": "Ligação do Papai Noel: ele fala o nome do seu filho",
        "lead": "O telefone toca, a criança atende e ouve: “Ho, ho, ho! É você?”. Na Carta Mágica o Papai Noel conversa com o seu filho por até 2 minutos, chamando ele pelo nome.",
        "emoji": "📞",
        "blocks": [
            ("h2", "Como é a ligação"),
            ("ol", [
                "Você digita o primeiro nome da criança e toca em atender.",
                "O Papai Noel cumprimenta a criança <b>pelo nome</b>. Esse “alô” é grátis.",
                "Na ligação completa ele faz 3 perguntas: quantos anos ela tem, o que fez de bom neste ano e qual é o pedido de Natal.",
                "A criança responde falando no microfone ou, se preferir, digitando com a ajuda de um adulto.",
                "No fim, ela escolhe: ouvir uma historinha, tirar uma foto de lembrança ou conversar mais um pouquinho.",
            ]),
            LIGAR,
            ("h2", "Quanto custa"),
            ("ul", [
                "<b>Ligação avulsa</b>: R$ 5,90, pagamento único, uma ligação de até 2 minutos.",
                "<b>Natal Completo</b>: já vem com 1 ligação, além da carta completa.",
                "<b>Pacote Família</b>: 3 ligações, uma para cada criança.",
            ]),
            ("h2", "O que os pais recebem depois"),
            ("p", "Quando a ligação termina, aparece um resumo só para os adultos, com a idade, o que a criança contou que fez de bom e o pedido de Natal. Com um toque, esse resumo vira uma <a href=\"/carta-do-papai-noel-personalizada\">carta do Papai Noel personalizada</a>, já preenchida."),
            ("h2", "Cuidados com a criança"),
            ("ul", [
                "Um adulto precisa autorizar antes de a ligação começar.",
                "O Papai Noel nunca promete presente: ele diz que anotou o pedido.",
                "Se a criança falar de algo triste ou delicado, ele responde com acolhimento e sugere conversar com um adulto de confiança.",
                "A foto de lembrança é montada no próprio aparelho e não é enviada para nós.",
            ]),
            ("dica", "Faça a ligação num lugar silencioso e deixe o celular no viva-voz. A reação da criança costuma render o melhor vídeo do Natal."),
        ],
        "faq": [
            ("O Papai Noel fala mesmo o nome da criança?", "Sim. Você informa o primeiro nome e ele chama a criança pelo nome já no começo da ligação."),
            ("Quanto tempo dura a ligação?", "Até 2 minutos. Um relógio na tela mostra o tempo que falta."),
            ("Precisa de microfone?", "O microfone deixa a conversa mais natural, mas não é obrigatório: dá para responder digitando."),
            ("É uma ligação de telefone de verdade?", "Não. A ligação acontece dentro do site, com tela de chamada e a voz do Papai Noel. Não usa os minutos do seu plano de celular."),
        ],
    },
    {
        "slug": "falar-com-o-papai-noel",
        "title": "Falar com o Papai Noel Online: Conversa com Voz para Crianças",
        "desc": "Quer que seu filho fale com o Papai Noel? Veja como funciona a conversa com voz da Carta Mágica, em que ele chama a criança pelo nome e pergunta o pedido de Natal.",
        "h1": "Falar com o Papai Noel online: como funciona",
        "lead": "Nem toda família consegue ir ao shopping tirar foto com o Papai Noel. Pela internet, a criança conversa com ele em casa, de pijama, no horário que for melhor para vocês.",
        "emoji": "🎙️",
        "blocks": [
            ("h2", "Três jeitos de falar com o Papai Noel"),
            ("ul", [
                "<b>Por voz</b>: a <a href=\"/ligacao-do-papai-noel\">ligação do Papai Noel</a> dura até 2 minutos e ele chama a criança pelo nome.",
                "<b>Por carta</b>: a criança escreve, você fotografa e o <a href=\"/resposta-da-carta-do-papai-noel\">Papai Noel responde</a> citando o que ela contou.",
                "<b>Por carta pronta</b>: você conta as conquistas do ano e ele escreve uma <a href=\"/carta-do-papai-noel-personalizada\">carta personalizada</a>, com voz e PDF.",
            ]),
            ("h2", "O que a criança pode contar"),
            ("ul", [
                "A idade e a cidade onde mora.",
                "Uma coisa boa que fez neste ano: ajudou em casa, aprendeu a ler, cuidou do irmão.",
                "O pedido de Natal. Vale pedir algo para outra pessoa também.",
                "Uma pergunta: as renas comem o quê? Faz frio no Polo Norte?",
            ]),
            LIGAR,
            ("h2", "Como preparar a criança"),
            ("ol", [
                "Avise um pouco antes: “Acho que o Papai Noel vai ligar hoje”.",
                "Combine que ela pode falar devagar e que o Papai Noel escuta com paciência.",
                "Fique ao lado. Crianças pequenas às vezes ficam tímidas e precisam de um empurrãozinho.",
                "Grave a reação com outro celular.",
            ]),
            ("dica", "Crianças de 3 e 4 anos costumam só sorrir e balançar a cabeça. Tudo bem: você pode digitar a resposta por ela."),
        ],
        "faq": [
            ("A partir de que idade a criança consegue conversar?", "A partir dos 3 anos ela já participa com a ajuda de um adulto. Dos 5 anos em diante costuma responder sozinha."),
            ("A conversa é gravada?", "A conversa serve para o Papai Noel responder na hora. O resumo que aparece no fim fica só no seu aparelho."),
            ("Dá para falar mais de uma vez?", "Sim. O alô com o nome é grátis, e cada ligação completa custa R$ 5,90 ou usa as ligações do seu plano."),
        ],
    },
    {
        "slug": "telefone-do-papai-noel",
        "title": "Telefone do Papai Noel: Existe um Número para Ligar?",
        "desc": "Procurando o telefone ou o WhatsApp do Papai Noel? Entenda o que existe de verdade e veja uma alternativa segura: a ligação em que ele fala o nome da criança.",
        "h1": "Telefone do Papai Noel: existe um número para ligar?",
        "lead": "Muita criança pede: “Mãe, liga para o Papai Noel!”. Veja o que responder e como fazer essa ligação acontecer de um jeito seguro.",
        "emoji": "☎️",
        "blocks": [
            ("h2", "Existe um número oficial?"),
            ("p", "Não existe um telefone oficial do Papai Noel no Brasil. De tempos em tempos circulam números em redes sociais, mas muitos são de outros países, cobram ligação internacional ou simplesmente deixam de funcionar. Antes de ligar para qualquer número, confira de onde ele é e quanto custa."),
            ("h2", "Cuidados com números e perfis desconhecidos"),
            ("ul", [
                "Desconfie de quem pede o endereço da casa, o nome completo ou a escola da criança.",
                "Não deixe a criança conversar sozinha com perfis de WhatsApp que você não conhece.",
                "Nunca envie fotos da criança para um número desconhecido.",
                "Prefira experiências em que o adulto controla o que é informado.",
            ]),
            ("h2", "A alternativa: o Papai Noel liga pelo site"),
            ("p", "Na Carta Mágica a ligação acontece dentro do site. Você informa só o <b>primeiro nome</b> da criança, autoriza a conversa e ela ouve o Papai Noel chamando pelo nome. O alô é grátis e a ligação completa, de até 2 minutos, custa R$ 5,90."),
            LIGAR,
            ("dica", "Para deixar mais real, diga que o Papai Noel “retornou a ligação” e entregue o celular já tocando."),
        ],
        "faq": [
            ("Qual é o WhatsApp do Papai Noel?", "Não há um WhatsApp oficial. Pela Carta Mágica você recebe a carta e a voz do Papai Noel e encaminha pelo seu próprio WhatsApp."),
            ("A ligação pelo site gasta crédito do celular?", "Não. Ela usa a internet, como um vídeo ou um áudio."),
            ("Quais dados vocês pedem?", "Só o primeiro nome da criança para a ligação. Não pedimos sobrenome, escola nem endereço."),
        ],
    },
    {
        "slug": "cartao-de-natal-personalizado-com-foto",
        "title": "Cartão de Natal Personalizado com Foto da Família (Online)",
        "desc": "Faça um cartão de Natal personalizado com a foto da família, o sobrenome e uma mensagem. Escolha o modelo, ajuste a foto e baixe para imprimir ou mandar no WhatsApp.",
        "h1": "Cartão de Natal personalizado com a foto da família",
        "lead": "Um cartão com a foto de vocês emociona mais do que qualquer imagem pronta da internet. Na Carta Mágica você monta o seu em poucos minutos, direto no celular.",
        "emoji": "🖼️",
        "blocks": [
            ("h2", "O que dá para personalizar"),
            ("ul", [
                "O modelo: são vários estilos, do clássico vermelho e dourado ao mais moderno.",
                "A foto: escolha da galeria ou tire na hora, depois ajuste o zoom e a posição.",
                "O título, o nome da família, os nomes das crianças e o ano.",
                "A mensagem e a assinatura.",
                "O formato: em pé (retrato) ou deitado (paisagem).",
            ]),
            ("cta", ("Fazer meu cartão de Natal", "/#cartao-natal")),
            ("h2", "Quantos cartões posso fazer"),
            ("ul", [
                "<b>Grátis</b>: 1 cartão.",
                "<b>Natal Completo</b>: 5 cartões.",
                "<b>Pacote Família</b>: cartões ilimitados.",
            ]),
            ("h2", "Dicas para a foto ficar bonita"),
            ("ol", [
                "Use luz natural, perto de uma janela, e evite o flash.",
                "Combine as roupas em dois ou três tons, sem estampas muito chamativas.",
                "Deixe um espaço acima das cabeças: ele ajuda na hora de encaixar no modelo.",
                "Tire várias fotos em sequência. Com criança, a melhor quase nunca é a primeira.",
            ]),
            ("h2", "Imprimir ou enviar"),
            ("p", "O cartão pode ser baixado como imagem, para o WhatsApp e as redes sociais, ou em PDF, para imprimir em casa ou na gráfica, inclusive no formato dobrado."),
            ("dica", "Sua foto fica só no seu aparelho. Ela não é enviada para os nossos servidores nem publicada em lugar nenhum."),
        ],
        "faq": [
            ("O cartão de Natal é grátis?", "O primeiro cartão é grátis. Os planos liberam mais cartões."),
            ("Vocês guardam a minha foto?", "Não. A montagem é feita no seu aparelho e a foto não é armazenada por nós."),
            ("Posso fazer sem foto?", "Pode. Os modelos também ficam bonitos só com o nome da família e a mensagem."),
        ],
    },
    {
        "slug": "mensagem-de-natal-para-filhos",
        "title": "Mensagem de Natal para Filhos: 25 Frases para Emocionar",
        "desc": "25 mensagens de Natal para filhos pequenos, adolescentes e adultos. Frases curtas para cartão, bilhete e WhatsApp, e uma ideia para o Natal das crianças.",
        "h1": "Mensagem de Natal para filhos: 25 frases para copiar",
        "lead": "Às vezes o que a gente sente não cabe nas palavras. Estas frases ajudam a começar. Copie, mude o que quiser e assine com o seu nome.",
        "emoji": "💛",
        "blocks": [
            ("h2", "Para filhos pequenos"),
            ("ul", [
                "Meu presente de Natal chegou no dia em que você nasceu.",
                "Que o seu Natal tenha o tamanho do seu sorriso.",
                "Você deixa todos os dias da nossa casa com cara de festa.",
                "O Papai Noel me contou que você foi incrível neste ano. Eu já sabia.",
                "Feliz Natal, meu pequeno. Obrigada por me ensinar a ver magia nas coisas simples.",
                "Enquanto você acreditar em magia, eu vou cuidar para que ela exista.",
                "Que nunca falte colo, risada e panetone na sua vida.",
                "Você é a estrela mais bonita da nossa árvore.",
            ]),
            ("h2", "Para filhos adolescentes"),
            ("ul", [
                "Você cresceu, mas o meu orgulho cresceu junto. Feliz Natal.",
                "Obrigado por ainda sentar à mesa com a gente. Isso vale mais do que qualquer presente.",
                "Que o próximo ano traga respostas para as suas perguntas e coragem para os seus sonhos.",
                "Pode contar comigo, mesmo quando você achar que não precisa.",
                "Tenho orgulho de quem você está se tornando.",
                "Feliz Natal para a pessoa que mais me ensina a ter paciência e a rir de mim mesma.",
                "Seu quarto pode ser uma bagunça, mas o seu coração é lindo.",
                "Que você nunca perca a vontade de voltar para casa.",
            ]),
            ("h2", "Para filhos adultos"),
            ("ul", [
                "A casa ficou maior quando você saiu, e o Natal fica completo quando você chega.",
                "Ver você cuidando da sua própria família é o meu melhor presente.",
                "Obrigada por continuar me ligando só para saber se eu estou bem.",
                "Meu desejo de Natal é simples: saúde para você e tempo para a gente.",
                "Você sempre será a minha criança, mesmo com cabelo branco.",
                "Que a vida devolva em dobro todo o carinho que você espalha.",
                "Feliz Natal, meu filho. A mesa está posta e o seu lugar é o mesmo de sempre.",
                "Fiz o melhor que pude, e você fez disso algo muito maior.",
                "Em qualquer cidade onde você estiver, o meu abraço chega.",
            ]),
            ("h2", "Uma ideia para os pequenos"),
            ("p", "Para as crianças, uma mensagem assinada pelo Papai Noel tem um peso especial. Você conta o que seu filho conquistou neste ano e ele recebe uma carta com o nome dele, lida pela voz do Papai Noel."),
            CRIAR,
        ],
        "faq": [
            ("Como escrever uma mensagem de Natal para um filho?", "Comece com uma lembrança do ano, diga do que você sente orgulho e termine com um desejo. Três frases sinceras bastam."),
            ("Posso usar as frases em um cartão?", "Pode. Elas são livres para copiar em cartões, bilhetes e mensagens."),
        ],
    },
    {
        "slug": "mensagem-de-natal-para-netos",
        "title": "Mensagem de Natal para Netos: Frases de Avó e Avô",
        "desc": "Mensagens de Natal de avó e avô para netos, para escrever no cartão, mandar no WhatsApp ou ler na ceia. E uma ideia de presente para o neto que mora longe.",
        "h1": "Mensagem de Natal para netos: frases de avó e avô",
        "lead": "Carinho de avó e de avô atravessa qualquer distância. Escolha uma frase, escreva à mão no cartão ou mande por áudio com a sua voz.",
        "emoji": "👵",
        "blocks": [
            ("h2", "Frases curtas"),
            ("ul", [
                "Meu neto, você é a parte mais doce da minha história.",
                "Ser avó é ganhar um Natal novo a cada visita sua.",
                "Feliz Natal ao dono do abraço mais gostoso da família.",
                "Vovô ama você do tamanho do céu, ida e volta.",
                "A minha árvore só fica completa com o seu desenho pendurado.",
                "Que o Menino Jesus e o Papai Noel cuidem de você o ano inteiro.",
                "Você chegou e a casa da vovó voltou a ter barulho de criança.",
                "Guarde este cartão. Um dia você vai saber o quanto foi amado.",
            ]),
            ("h2", "Para o neto que mora longe"),
            ("ul", [
                "A saudade é grande, mas o amor da vovó chega antes do correio.",
                "Deixei um lugar para você na mesa, mesmo sabendo que neste ano é por vídeo.",
                "Conte os dias comigo: logo eu estou aí para apertar essas bochechas.",
                "Mandei um abraço pelo Papai Noel. Ele prometeu entregar.",
            ]),
            ("h2", "Para ler na ceia"),
            ("p", "“Neste Natal eu agradeço por cada um de vocês. Meus netos são a prova de que a vida continua bonita. Que vocês cresçam com saúde, estudem, sejam gentis e nunca esqueçam o caminho da casa dos avós.”"),
            ("h2", "Presente de avó: uma carta do Papai Noel"),
            ("p", "Os avós podem criar a carta e mandar o link pelo WhatsApp para os pais abrirem com a criança. No campo de recado, escreva algo como “a vovó e o vovô contaram para o Papai Noel que você é muito estudioso”. Veja mais em <a href=\"/carta-do-papai-noel-para-neto\">carta do Papai Noel para neto</a>."),
            CRIAR,
        ],
        "faq": [
            ("Sou avó e não entendo de celular. Consigo fazer a carta?", "Consegue. São poucas perguntas, com letras grandes, e a carta fica pronta em cerca de 2 minutos."),
            ("Posso mandar a carta para outra cidade?", "Sim. A carta gera um link que você envia pelo WhatsApp."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-menina",
        "title": "Carta do Papai Noel para Menina, com o Nome Dela",
        "desc": "Carta do Papai Noel para menina, personalizada com o nome, a idade e as conquistas dela. Escolha a cor da carta, o tom do texto e ouça a voz do Papai Noel.",
        "h1": "Carta do Papai Noel para menina, com o nome dela",
        "lead": "Bailarina, jogadora de futebol, cientista, leitora, artista: cada menina é única, e a carta dela também precisa ser. Conte como foi o ano e o Papai Noel escreve o resto.",
        "emoji": "🎀",
        "blocks": [
            ("h2", "Ideias do que contar"),
            ("ul", [
                "Aprendeu a ler, a nadar ou a andar de bicicleta sem rodinha.",
                "Cuidou da irmãzinha, do primo ou do bichinho de estimação.",
                "Foi corajosa no dentista ou na vacina.",
                "Entrou no balé, no judô, no futebol ou na aula de música.",
                "Dividiu os brinquedos e fez uma amiga nova na escola.",
            ]),
            ("h2", "Escolha a cor e o jeito da carta"),
            ("p", "A carta pode ser clássica, rosa, lilás, azul ou verde. A cor é ela quem escolhe: tem menina que ama rosa e tem menina que prefere azul. O texto pode ser mágico, emocionante, engraçado ou de aventura."),
            ("h2", "Trecho de exemplo"),
            ("carta", [
                "Ho, ho, ho! Olá, Helena, minha estrelinha de Belo Horizonte!",
                "Os duendes me contaram que neste ano você aprendeu a ler sozinha e que lê historinhas para a sua irmã antes de dormir. Fiquei tão orgulhoso que a minha barba até balançou!",
                "Anotei o seu pedido no Grande Livro Dourado, com a minha caneta de pena.",
            ]),
            CRIAR,
            ("dica", "Use o campo de detalhes para contar o nome da melhor amiga e da boneca ou do bichinho preferido. A reação quando o Papai Noel cita esses nomes é inesquecível."),
        ],
        "faq": [
            ("A carta para menina é diferente da carta para menino?", "O texto é escrito a partir do que você conta sobre a criança, não a partir do gênero. Por isso cada carta sai diferente."),
            ("Posso escolher a cor rosa?", "Sim. Há cinco cores, e a criança pode trocar depois de pronta."),
            ("A carta é grátis?", "Sim, a carta grátis já vem personalizada. O Natal Completo acrescenta a voz na carta inteira, o PDF e outros extras."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-menino",
        "title": "Carta do Papai Noel para Menino, com o Nome Dele",
        "desc": "Carta do Papai Noel para menino, com o nome, a idade e as conquistas dele. Texto de aventura, engraçado ou emocionante, com a voz do Papai Noel.",
        "h1": "Carta do Papai Noel para menino, com o nome dele",
        "lead": "O menino que não para quieto, o que ama dinossauros, o que joga bola o dia inteiro, o tímido que desenha: conte quem ele é e o Papai Noel escreve uma carta só para ele.",
        "emoji": "🚀",
        "blocks": [
            ("h2", "Ideias do que contar"),
            ("ul", [
                "Aprendeu a amarrar o tênis, a nadar ou a ler.",
                "Melhorou na escola ou passou de ano.",
                "Ajudou a guardar os brinquedos e a arrumar a mesa.",
                "Foi carinhoso com o irmão mais novo ou com os avós.",
                "Largou a chupeta, a fralda ou o medo do escuro.",
            ]),
            ("h2", "O tom que combina com ele"),
            ("ul", [
                "<b>Aventura</b>: para quem gosta de heróis, missões e exploradores.",
                "<b>Engraçado</b>: com as trapalhadas das renas e dos duendes.",
                "<b>Mágico</b>: o clássico, com brilho e neve.",
                "<b>Emocionante</b>: mais delicado, bom para ler em família.",
            ]),
            ("h2", "Trecho de exemplo"),
            ("carta", [
                "Ho, ho, ho! Olá, Davi, meu explorador de Fortaleza!",
                "O Rodolfo veio correndo me avisar: “Papai Noel, o Davi aprendeu a andar de bicicleta sem rodinha!”. A oficina inteira bateu palmas.",
                "Tenho uma missão secreta para você: dar um abraço bem apertado em alguém da sua família antes do Natal.",
            ]),
            CRIAR,
        ],
        "faq": [
            ("Meu filho gosta de futebol. O Papai Noel fala disso?", "Fala, se você contar. Escreva o esporte, o time ou a brincadeira favorita no campo de detalhes."),
            ("Serve para meninos mais velhos?", "Sim. Para quem tem 9 ou 10 anos, o tom de aventura costuma funcionar melhor."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-neto",
        "title": "Carta do Papai Noel para Neto: Presente de Avó e Avô",
        "desc": "Avó ou avô: crie uma carta do Papai Noel para o seu neto, com o nome dele e um recado seu. Fica pronta em 2 minutos e pode ser enviada pelo WhatsApp.",
        "h1": "Carta do Papai Noel para neto: um presente de avó e avô",
        "lead": "Um presente que não ocupa espaço no armário e que o neto vai guardar na memória: uma carta do Papai Noel contando que os avós falaram bem dele.",
        "emoji": "🧓",
        "blocks": [
            ("h2", "Passo a passo, bem simples"),
            ("ol", [
                "Toque no botão vermelho <b>Criar minha carta grátis</b>.",
                "Escreva o primeiro nome do neto, a idade e a cidade.",
                "Conte uma ou duas coisas boas que ele fez neste ano.",
                "No recado, escreva o que os avós querem dizer.",
                "Espere a carta ficar pronta e toque em enviar pelo WhatsApp.",
            ]),
            ("h2", "Ideias de recado dos avós"),
            ("ul", [
                "“A vovó contou que você ajuda a fazer o bolo de domingo.”",
                "“O vovô disse que você é o melhor companheiro de pescaria.”",
                "“Seus avós sentem saudade e esperam você nas férias.”",
            ]),
            CRIAR,
            ("h2", "Para vários netos"),
            ("p", "Cada neto recebe a própria carta, com as conquistas dele. O Pacote Família cobre até 5 crianças e é o mais usado por avós com muitos netos. Veja também <a href=\"/carta-do-papai-noel-para-irmaos\">carta do Papai Noel para irmãos</a>."),
            ("dica", "Se o neto mora longe, combine com os pais um horário e assista por chamada de vídeo enquanto ele abre o envelope."),
        ],
        "faq": [
            ("Preciso instalar algum aplicativo?", "Não. Tudo funciona pelo navegador do celular ou do computador."),
            ("Posso imprimir e levar na ceia?", "Pode. O PDF para imprimir faz parte do Natal Completo, e a carta grátis tem o botão de imprimir do próprio site."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-afilhado",
        "title": "Carta do Papai Noel para Afilhado: Presente dos Padrinhos",
        "desc": "Madrinha ou padrinho: surpreenda o seu afilhado com uma carta do Papai Noel personalizada, com o nome dele e um recado seu. Simples, barato e emocionante.",
        "h1": "Carta do Papai Noel para afilhado: presente de madrinha e padrinho",
        "lead": "Brinquedo quebra e roupa deixa de servir. Uma carta em que o Papai Noel fala do afilhado pelo nome fica guardada por muitos anos.",
        "emoji": "🎁",
        "blocks": [
            ("h2", "Por que funciona como presente"),
            ("ul", [
                "Cabe em qualquer orçamento: a carta é grátis e os extras são baratos.",
                "Chega pelo WhatsApp, mesmo que você more em outra cidade.",
                "Pode acompanhar um presente físico, dentro do pacote.",
                "Mostra que você prestou atenção no ano da criança.",
            ]),
            ("h2", "O que perguntar aos pais antes"),
            ("ol", [
                "O que ele aprendeu ou conquistou neste ano?",
                "Qual é o pedido de Natal dele?",
                "Como se chamam o melhor amigo e o bichinho de estimação?",
                "Existe algum assunto delicado que é melhor não citar?",
            ]),
            ("h2", "Ideias de recado"),
            ("ul", [
                "“A sua madrinha me contou que você é o afilhado mais carinhoso do mundo.”",
                "“O seu padrinho está muito orgulhoso das suas notas.”",
            ]),
            CRIAR,
            ("dica", "Imprima a carta, enrole como um pergaminho, amarre com fita vermelha e prenda no laço do presente."),
        ],
        "faq": [
            ("Preciso da autorização dos pais?", "A carta deve ser criada por um adulto responsável ou com o conhecimento dos pais. Pedimos só o primeiro nome, a idade e a cidade."),
            ("Dá para fazer para mais de um afilhado?", "Sim, cada criança recebe uma carta diferente."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-crianca-de-3-a-5-anos",
        "title": "Carta do Papai Noel para Criança de 3, 4 e 5 Anos",
        "desc": "Como fazer uma carta do Papai Noel para crianças de 3 a 5 anos: frases curtas, conquistas da idade, voz do Papai Noel e dicas para ler junto.",
        "h1": "Carta do Papai Noel para criança de 3 a 5 anos",
        "lead": "Nessa idade a magia está no auge. A criança ainda não lê sozinha, então a voz do Papai Noel e as figuras fazem toda a diferença.",
        "emoji": "🧸",
        "blocks": [
            ("h2", "Conquistas típicas da idade"),
            ("ul", [
                "Largou a fralda, a chupeta ou a mamadeira.",
                "Começou a escolinha e fez os primeiros amigos.",
                "Aprendeu as cores, os números ou a escrever o próprio nome.",
                "Dorme na própria cama.",
                "Come sozinho e experimenta comidas novas.",
            ]),
            ("h2", "Como ler a carta com os pequenos"),
            ("ol", [
                "Escolha um momento calmo, depois do banho.",
                "Deixe a criança abrir o envelope tocando na tela.",
                "Aperte o play e deixe o Papai Noel ler. Acompanhe com o dedo.",
                "Pare quando ele disser o nome dela e pergunte: “Você ouviu?”.",
                "Leia de novo no dia seguinte. Criança pequena adora repetir.",
            ]),
            CRIAR,
            ("h2", "Mais magia para essa idade"),
            ("ul", [
                "A <a href=\"/ligacao-do-papai-noel\">ligação do Papai Noel</a>, em que ele chama a criança pelo nome.",
                "Os <a href=\"/desenhos-de-natal-para-colorir\">desenhos de Natal para colorir</a>.",
                "O <a href=\"/calendario-do-advento-infantil\">calendário do advento</a>, com uma surpresa por dia.",
            ]),
            ("dica", "Evite usar a carta como ameaça (“se não obedecer, o Papai Noel não vem”). Nessa idade, elogiar o que a criança já faz bem funciona muito melhor."),
        ],
        "faq": [
            ("Criança de 3 anos entende a carta?", "Ela entende o principal: o Papai Noel sabe o nome dela e está feliz com ela. O resto vem com a voz e a repetição."),
            ("Qual tom escolher?", "Mágico ou engraçado. O tom de aventura costuma agradar mais a partir dos 6 anos."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-crianca-de-6-a-9-anos",
        "title": "Carta do Papai Noel para Criança de 6, 7, 8 e 9 Anos",
        "desc": "Carta do Papai Noel para crianças de 6 a 9 anos: como citar a escola, a leitura, os amigos e os esportes, e como aproveitar a carta para incentivar a leitura.",
        "h1": "Carta do Papai Noel para criança de 6 a 9 anos",
        "lead": "É a idade em que a criança começa a ler sozinha, e ler uma carta endereçada a ela, com o próprio nome, é um incentivo e tanto.",
        "emoji": "📚",
        "blocks": [
            ("h2", "Conquistas típicas da idade"),
            ("ul", [
                "Aprendeu a ler e a escrever.",
                "Passou de ano ou melhorou numa matéria difícil.",
                "Entrou num esporte, numa aula de música ou de dança.",
                "Perdeu os primeiros dentes de leite.",
                "Ganhou responsabilidades: arrumar a cama, cuidar do bichinho.",
                "Foi um bom amigo e ajudou um colega.",
            ]),
            ("h2", "Transforme a carta em incentivo à leitura"),
            ("ol", [
                "Imprima a carta e entregue num envelope fechado.",
                "Deixe a criança ler sozinha, no tempo dela.",
                "Depois, ouçam juntos a voz do Papai Noel para conferir.",
                "Proponha que ela escreva a resposta. O <a href=\"/papel-timbrado-carta-papai-noel\">papel timbrado do Polo Norte</a> é grátis.",
            ]),
            CRIAR,
            ("h2", "A Missão secreta de Natal"),
            ("p", "Toda carta traz uma pequena missão para cumprir até o dia 24: ajudar alguém, fazer um desenho, doar um brinquedo. Crianças dessa idade levam a missão muito a sério e adoram contar depois que cumpriram."),
            ("dica", "Se a criança escreveu uma cartinha, use-a. Fotografe e envie em “Enviar a cartinha”: a resposta cita o que ela escreveu."),
        ],
        "faq": [
            ("A carta fica longa demais para quem está aprendendo a ler?", "A carta grátis é mais curta. A do Natal Completo é mais longa, e a voz do Papai Noel ajuda a acompanhar."),
            ("Meu filho de 8 anos começou a desconfiar. E agora?", "Veja a página Papai Noel existe?, com ideias de como conversar sem estragar a magia dos irmãos menores."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-crianca-de-10-anos",
        "title": "Carta do Papai Noel para Criança de 10 Anos ou Mais",
        "desc": "Seu filho de 10, 11 ou 12 anos já desconfia? Veja como fazer uma carta do Papai Noel que respeita a idade dele e mantém a tradição viva na família.",
        "h1": "Carta do Papai Noel para criança de 10 anos ou mais",
        "lead": "Aos 10 anos muita criança já sabe ou desconfia. Isso não precisa acabar com a carta: ela muda de papel e vira um gesto de carinho da família.",
        "emoji": "🧭",
        "blocks": [
            ("h2", "O que muda nessa idade"),
            ("ul", [
                "A criança percebe exageros. Prefira um texto mais sincero e menos infantil.",
                "Ela valoriza ser reconhecida: cite esforços de verdade, não só resultados.",
                "O humor funciona bem, principalmente com as trapalhadas dos duendes.",
                "Ela pode virar “ajudante do Papai Noel” para os irmãos e primos menores.",
            ]),
            ("h2", "O que contar"),
            ("ul", [
                "Uma dificuldade que ela enfrentou neste ano e como lidou com isso.",
                "Uma atitude madura: cuidou de alguém, assumiu um erro, ajudou em casa.",
                "Um interesse novo: programação, instrumento, esporte, leitura.",
            ]),
            CRIAR,
            ("h2", "Convide para o outro lado da magia"),
            ("p", "Uma ideia que funciona muito bem: peça ajuda ao filho mais velho para criar a carta do irmão menor. Ele escolhe a cor, lembra das conquistas e guarda o segredo. Muitos pais contam que essa passagem é um dos momentos mais bonitos do Natal."),
            ("dica", "Escolha o tom Aventura ou Engraçado e escreva um recado dos pais mais direto, como “temos muito orgulho de você”."),
        ],
        "faq": [
            ("Vale a pena fazer carta para quem não acredita mais?", "Vale, se for apresentada como uma tradição carinhosa da família, e não como um truque."),
            ("Até que idade dá para criar a carta?", "Não há limite rígido. A maioria das cartas é para crianças de até 12 anos."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-para-alunos",
        "title": "Carta do Papai Noel para Alunos: Ideias para Professores",
        "desc": "Professora ou professor: veja como usar a carta do Papai Noel na sala de aula, com atividade de escrita, entrega no último dia e cuidados com os dados das crianças.",
        "h1": "Carta do Papai Noel para alunos: ideias para a sala de aula",
        "lead": "O fim do ano na educação infantil e nos primeiros anos pede um fechamento afetivo. A carta do Papai Noel une leitura, escrita e reconhecimento de cada criança.",
        "emoji": "🍎",
        "blocks": [
            ("h2", "Projeto em três aulas"),
            ("ol", [
                "<b>Aula 1, escrever</b>: cada aluno escreve ou dita a carta para o Papai Noel. Use o <a href=\"/modelo-de-carta-para-o-papai-noel\">modelo para preencher</a>.",
                "<b>Aula 2, decorar</b>: desenhos, colagens e envelope. Monte uma caixa de correio da turma.",
                "<b>Aula 3, receber</b>: no último dia, o Papai Noel “responde”. Leia algumas cartas em voz alta.",
            ]),
            ("h2", "O que elogiar em cada aluno"),
            ("ul", [
                "Um avanço escolar: aprendeu a ler, melhorou a letra, perdeu o medo de perguntar.",
                "Uma atitude: ajuda os colegas, divide o material, cumprimenta todo mundo.",
                "Um talento: desenha, canta, conta histórias, é bom de bola.",
            ]),
            ("h2", "Cuidados importantes"),
            ("ul", [
                "Use só o primeiro nome da criança. Não é preciso sobrenome nem endereço.",
                "Avise as famílias sobre a atividade e respeite quem não comemora o Natal.",
                "Garanta que todos os alunos recebam uma carta, sem comparar tamanho ou elogios.",
                "Não associe a carta a notas ou a castigos.",
            ]),
            CRIAR,
            ("dica", "Para turmas grandes, combine com as famílias: cada responsável cria a carta em casa e envia o PDF, e a escola organiza a entrega."),
        ],
        "faq": [
            ("Existe plano para a turma inteira?", "Os planos atuais são para famílias: até 2 crianças no Natal Completo e até 5 no Pacote Família. A carta grátis pode ser criada até 3 vezes por dia em cada aparelho."),
            ("Posso imprimir para entregar em papel?", "Sim. A carta tem botão de imprimir, e o PDF caprichado faz parte do Natal Completo."),
        ],
    },
    {
        "slug": "carta-do-papai-noel-no-whatsapp",
        "title": "Carta do Papai Noel no WhatsApp: Como Enviar para a Criança",
        "desc": "Veja como mandar a carta do Papai Noel pelo WhatsApp: link com envelope animado, imagem, PDF e áudio com a voz do Papai Noel, para pais, avós e padrinhos.",
        "h1": "Carta do Papai Noel no WhatsApp: como enviar",
        "lead": "A carta fica pronta no site e viaja pelo WhatsApp. Assim os avós, tios e padrinhos de qualquer cidade participam da surpresa.",
        "emoji": "💬",
        "blocks": [
            ("h2", "O que dá para enviar"),
            ("ul", [
                "<b>O link da carta</b>: quem recebe abre o envelope animado no próprio celular.",
                "<b>A imagem da carta</b>: boa para o grupo da família e para o Status.",
                "<b>O PDF</b>: para quem vai imprimir.",
                "<b>O vídeo com a voz</b>: a carta na tela e o Papai Noel lendo.",
            ]),
            ("h2", "Passo a passo"),
            ("ol", [
                "Crie a carta com o nome e as conquistas da criança.",
                "Na carta pronta, toque em <b>Compartilhar</b> e escolha WhatsApp.",
                "Selecione a conversa ou o grupo e envie.",
            ]),
            CRIAR,
            ("h2", "Ideias de mensagem para acompanhar"),
            ("ul", [
                "“Chegou correspondência do Polo Norte para a Alice. Abram juntos!”",
                "“Vó, olha o que o Papai Noel escreveu para o seu neto.”",
                "“Mostrem para o Theo antes de dormir e gravem a carinha dele.”",
            ]),
            ("dica", "Para a criança não ver o remetente, mande a carta para o celular do outro responsável, ou abra o link direto no navegador."),
        ],
        "faq": [
            ("O Papai Noel manda a mensagem do número dele?", "Não. A carta é criada no site e você encaminha pelo seu próprio WhatsApp."),
            ("O link expira?", "A carta fica guardada no aparelho em que foi criada e, com o login, no painel da família. Baixe a imagem ou o PDF para guardar com segurança."),
            ("Quem recebe precisa pagar?", "Não. Abrir a carta pelo link é grátis."),
        ],
    },
    {
        "slug": "endereco-do-papai-noel",
        "title": "Endereço do Papai Noel: Para Onde Enviar a Cartinha",
        "desc": "Qual é o endereço do Papai Noel? Conheça os endereços mais famosos do mundo, a campanha de cartas dos Correios e o jeito mais rápido de receber uma resposta.",
        "h1": "Endereço do Papai Noel: para onde enviar a cartinha",
        "lead": "A cartinha está pronta e a criança pergunta: “Para onde eu mando?”. Veja as opções, da tradição ao envio pela internet.",
        "emoji": "📬",
        "blocks": [
            ("h2", "Os endereços mais conhecidos"),
            ("ul", [
                "<b>Finlândia</b>: a cidade de Rovaniemi, na Lapônia, tem a Vila do Papai Noel e um correio que recebe cartas do mundo inteiro.",
                "<b>Canadá</b>: o correio canadense usa o endereço simbólico “Santa Claus, North Pole”, com o código postal H0H 0H0.",
                "<b>Polo Norte</b>: é o endereço da imaginação, que vale em qualquer país.",
            ]),
            ("p", "Cartas enviadas ao exterior levam semanas e nem sempre recebem resposta em português. Se a ideia é a criança receber uma resposta antes do Natal, é melhor combinar essa tradição com uma opção mais rápida."),
            ("h2", "No Brasil: a campanha dos Correios"),
            ("p", "Os Correios realizam todos os anos a campanha Papai Noel dos Correios, em que cartas de crianças são adotadas por padrinhos que doam os presentes. As datas e as regras mudam a cada ano, então consulte o site oficial dos Correios antes de participar."),
            ("h2", "O jeito mais rápido: enviar pelo celular"),
            ("ol", [
                "A criança escreve a cartinha à mão.",
                "Você fotografa e envia em <b>Enviar a cartinha</b>.",
                "O Polo Norte lê a letra dela e entrega um número de protocolo.",
                "A resposta chega com o nome dela, citando o que ela escreveu.",
            ]),
            ("cta", ("Enviar a cartinha do meu filho", "/#enviar-cartinha")),
            ("dica", "Para manter o ritual, deixe a criança colocar a carta de papel numa caixa de correio de brinquedo. À noite você “recolhe” e fotografa."),
        ],
        "faq": [
            ("Qual é o CEP do Papai Noel?", "No Canadá existe o código postal simbólico H0H 0H0. No Brasil não há um CEP oficial do Papai Noel."),
            ("O Papai Noel responde cartas enviadas pelo correio?", "Depende do país e do programa. Pela Carta Mágica a resposta chega em minutos, ou na data que você escolher."),
            ("A foto da cartinha fica guardada?", "Não. Ela é lida na hora para escrever a resposta e não é armazenada."),
        ],
    },
    {
        "slug": "onde-mora-o-papai-noel",
        "title": "Onde Mora o Papai Noel? Polo Norte ou Lapônia",
        "desc": "Onde mora o Papai Noel: no Polo Norte ou na Lapônia? Uma explicação simples para contar às crianças, com curiosidades sobre a oficina, os duendes e as renas.",
        "h1": "Onde mora o Papai Noel?",
        "lead": "Uma das perguntas preferidas das crianças tem duas respostas, e as duas são boas de contar na hora de dormir.",
        "emoji": "🏔️",
        "blocks": [
            ("h2", "Resposta 1: no Polo Norte"),
            ("p", "Na tradição mais conhecida no Brasil e nos Estados Unidos, o Papai Noel mora no Polo Norte, o ponto mais ao norte do planeta. É um lugar de gelo e de mar congelado, onde no inverno a noite dura meses. Na imaginação das crianças, é lá que ficam a casa dele, a oficina de brinquedos e o estábulo das renas."),
            ("h2", "Resposta 2: na Lapônia"),
            ("p", "Para os europeus, o Papai Noel mora na Lapônia, uma região no norte da Finlândia. A cidade de Rovaniemi, que fica na linha do Círculo Polar Ártico, tem até uma Vila do Papai Noel, aberta a visitantes."),
            ("h2", "Como explicar para a criança"),
            ("ul", [
                "“Ele mora num lugar muito frio, bem lá em cima no mapa.” Mostre no globo.",
                "“A casa dele tem uma oficina onde os duendes fazem os brinquedos.”",
                "“As renas dormem num estábulo quentinho e treinam para voar.”",
                "“A Mamãe Noel faz biscoitos e ajuda a ler as cartas.”",
            ]),
            ("h2", "Curiosidades para contar"),
            ("ul", [
                "No verão do Ártico, o sol aparece até de madrugada.",
                "As renas existem de verdade e vivem em regiões frias do norte.",
                "No céu de lá aparecem as auroras boreais, luzes verdes e roxas que dançam.",
                "No Brasil é verão no Natal, e por isso o Papai Noel chega aqui suando no casaco vermelho.",
            ]),
            ("cta", ("Ver onde o Papai Noel está agora", "/#rastreador")),
            ("p", "Depois da conversa, que tal uma carta vinda de lá? O Papai Noel conta que espiou a cidade do seu filho lá do Polo Norte."),
            CRIAR,
        ],
        "faq": [
            ("O Polo Norte tem terra firme?", "Não. O Polo Norte fica sobre o Oceano Ártico, coberto por gelo flutuante."),
            ("Dá para visitar a casa do Papai Noel?", "A Vila do Papai Noel em Rovaniemi, na Finlândia, recebe visitantes."),
        ],
    },
    {
        "slug": "nomes-das-renas-do-papai-noel",
        "title": "Nomes das Renas do Papai Noel em Português (as 9 Renas)",
        "desc": "Quais são os nomes das 9 renas do Papai Noel? Veja a lista em português, o jeito de cada uma, a história do Rodolfo e brincadeiras para fazer com as crianças.",
        "h1": "Nomes das renas do Papai Noel em português",
        "lead": "São nove renas puxando o trenó. Oito vêm de um poema do século 19 e a nona, a mais famosa, chegou mais de cem anos depois.",
        "emoji": "🦌",
        "blocks": [
            ("h2", "As 9 renas"),
            ("ol", [
                "<b>Rodolfo</b> (Rudolph): a rena do nariz vermelho, que vai na frente iluminando o caminho.",
                "<b>Corredora</b> (Dasher): a mais veloz.",
                "<b>Dançarina</b> (Dancer): a mais graciosa.",
                "<b>Empinadora</b> (Prancer): a mais animada, sempre saltitando.",
                "<b>Raposa</b> (Vixen): a mais esperta.",
                "<b>Cometa</b> (Comet): a que voa mais alto.",
                "<b>Cupido</b> (Cupid): a mais carinhosa.",
                "<b>Trovão</b> (Donner): a mais forte.",
                "<b>Relâmpago</b> (Blitzen): rápida como um raio.",
            ]),
            ("p", "As traduções variam um pouco de livro para livro, mas estes são os nomes mais usados no Brasil."),
            ("h2", "A história do Rodolfo"),
            ("p", "Rodolfo era diferente: tinha um nariz vermelho que brilhava, e por isso as outras renas riam dele. Numa noite de Natal com muita neblina, o Papai Noel não conseguia enxergar o caminho. Foi o nariz do Rodolfo que salvou a viagem. A história ensina que aquilo que nos faz diferentes pode ser a nossa maior qualidade."),
            ("h2", "Brincadeiras com as renas"),
            ("ul", [
                "<b>Qual rena é você?</b> Cada pessoa da família escolhe uma e explica o motivo.",
                "<b>Comida das renas</b>: misturem aveia e um pouco de granulado num potinho e deixem na janela.",
                "<b>Corrida das renas</b>: chifres de papel na cabeça e uma corrida de saco no quintal.",
                "<b>Jogo da memória</b>: desenhem as nove renas em cartões e brinquem de achar os pares.",
            ]),
            ("cta", ("Jogar os jogos de Natal", "/#jogo")),
            ("dica", "Na carta personalizada, o Papai Noel costuma contar uma trapalhada das renas. As crianças adoram quando o Rodolfo aparece."),
        ],
        "faq": [
            ("Quantas renas o Papai Noel tem?", "Nove: as oito do poema original e o Rodolfo."),
            ("As renas são machos ou fêmeas?", "A tradição não define. Uma curiosidade: entre as renas de verdade, são as fêmeas que mantêm os chifres durante o inverno."),
            ("O que as renas comem?", "Renas de verdade comem líquens, musgos e folhas. Na brincadeira, elas adoram cenoura."),
        ],
    },
    {
        "slug": "rastreador-do-papai-noel",
        "title": "Rastreador do Papai Noel: Onde Ele Está Agora?",
        "desc": "Onde está o Papai Noel agora? Acompanhe a viagem do trenó numa simulação da noite de Natal, veja quantos dias faltam e combine a hora de dormir.",
        "h1": "Rastreador do Papai Noel: onde ele está agora?",
        "lead": "Na noite de 24 de dezembro, a pergunta se repete a cada cinco minutos: “Ele já está chegando?”. O rastreador ajuda a responder e a levar a criançada para a cama.",
        "emoji": "🛷",
        "blocks": [
            ("h2", "Como funciona o rastreador da Carta Mágica"),
            ("ul", [
                "Antes do Natal, ele mostra quantos dias faltam para a viagem.",
                "Uma simulação acelerada mostra o trenó dando a volta ao mundo.",
                "No Brasil, o Papai Noel chega perto da meia-noite.",
                "Depois da entrega, ele volta ao Polo Norte e as renas vão dormir.",
            ]),
            ("cta", ("Abrir o rastreador do Papai Noel", "/#rastreador")),
            ("p", "É uma brincadeira: o trajeto é uma simulação feita para divertir, e não um rastreamento real."),
            ("h2", "Por onde o trenó passa"),
            ("p", "O Papai Noel acompanha a noite. Ele começa pelas ilhas do Pacífico, onde o dia 25 chega primeiro, segue pela Ásia, pela África e pela Europa e termina nas Américas. Por isso as crianças do Brasil estão entre as últimas a receber a visita."),
            ("h2", "Use o rastreador a seu favor"),
            ("ol", [
                "Mostre o trenó depois do jantar: “Olha, ele ainda está longe”.",
                "Combine a regra: ele só passa nas casas onde as crianças estão dormindo.",
                "Deixem juntos o lanche do Papai Noel e a cenoura das renas.",
                "Na manhã seguinte, mostre que ele já voltou para o Polo Norte.",
            ]),
            ("dica", "Existe também um rastreador tradicional mantido há décadas pelo comando de defesa aérea da América do Norte, o NORAD, que funciona na véspera de Natal."),
        ],
        "faq": [
            ("O rastreador é de verdade?", "É uma simulação lúdica para brincar com as crianças."),
            ("A que horas o Papai Noel chega ao Brasil?", "Na brincadeira, perto da meia-noite do dia 24 para o dia 25."),
            ("O rastreador é grátis?", "Sim, é só abrir o site."),
        ],
    },
    {
        "slug": "lista-do-papai-noel",
        "title": "Lista do Papai Noel: Meu Filho Está na Lista do Bom Comportamento?",
        "desc": "Descubra com as crianças se o nome está na Lista do Bom Comportamento do Papai Noel. Um teste rápido e divertido, sem ameaças e com um final feliz.",
        "h1": "Lista do Papai Noel: seu filho está na lista do bom comportamento?",
        "lead": "A famosa lista do Papai Noel pode ser uma brincadeira leve, que valoriza o que a criança fez de bom, em vez de virar ameaça.",
        "emoji": "📜",
        "blocks": [
            ("h2", "Como funciona o teste"),
            ("ol", [
                "A criança digita o primeiro nome.",
                "Responde a algumas perguntas rápidas sobre o ano dela.",
                "O Papai Noel consulta a lista e mostra o resultado.",
                "Dá para compartilhar o resultado com a família pelo WhatsApp.",
            ]),
            ("cta", ("Consultar a lista do Papai Noel", "/#lista")),
            ("h2", "Lista do bem, não lista do medo"),
            ("p", "Dizer “o Papai Noel está vendo” funciona por pouco tempo e pode deixar a criança ansiosa. Uma abordagem melhor é usar a lista para reconhecer esforços: “Você dividiu o brinquedo com o seu primo. Isso com certeza foi para a lista”."),
            ("h2", "Atitudes que entram na lista"),
            ("ul", [
                "Pedir desculpas quando erra.",
                "Ajudar em casa sem ninguém pedir.",
                "Ser gentil com quem está triste.",
                "Tentar de novo depois de errar.",
                "Cuidar dos brinquedos, das plantas e dos animais.",
            ]),
            ("h2", "Depois da lista"),
            ("p", "O passo seguinte é o <a href=\"/certificado-de-bom-comportamento\">certificado de bom comportamento</a>, assinado pelo Papai Noel, e a carta em que ele conta o que viu de bom neste ano."),
            CRIAR,
        ],
        "faq": [
            ("Existe lista dos malcriados?", "Na Carta Mágica, não. A brincadeira sempre termina de forma positiva e acolhedora."),
            ("O teste é grátis?", "Sim."),
            ("Quais dados são pedidos?", "Só o primeiro nome da criança."),
        ],
    },
    {
        "slug": "bilhete-do-papai-noel",
        "title": "Bilhete do Papai Noel: 20 Modelos Curtos para Deixar com o Presente",
        "desc": "20 bilhetes do Papai Noel prontos para copiar e deixar junto do presente, na árvore ou no prato de biscoitos. Curtos, carinhosos e fáceis de adaptar.",
        "h1": "Bilhete do Papai Noel: 20 modelos curtos para copiar",
        "lead": "Um bilhetinho ao lado do presente é a prova de que ele passou por ali. Copie, troque o nome e escreva com uma letra diferente da sua.",
        "emoji": "🗒️",
        "blocks": [
            ("h2", "Para deixar com o presente"),
            ("ul", [
                "Lucas, este presente foi escolhido com muito carinho na minha oficina. Ho, ho, ho!",
                "Para a Marina, que foi muito corajosa neste ano. Com orgulho, Papai Noel.",
                "Passei rapidinho, você estava dormindo como um anjo. Feliz Natal!",
                "Li a sua carta três vezes. Espero que goste!",
                "Os duendes capricharam neste embrulho só para você.",
                "Continue sendo gentil. O mundo precisa de crianças como você.",
                "Este presente veio do Polo Norte no trenó, bem do ladinho do Rodolfo.",
            ]),
            ("h2", "Para deixar no prato de biscoitos"),
            ("ul", [
                "Obrigado pelos biscoitos! Estavam deliciosos.",
                "As renas adoraram a cenoura. O Rodolfo comeu duas!",
                "Desculpe as migalhas. Eu estava com pressa.",
                "O leite estava geladinho, do jeito que eu gosto.",
                "No ano que vem eu volto. Guarde um biscoito para mim!",
            ]),
            ("h2", "Para elogiar uma conquista"),
            ("ul", [
                "Soube que você aprendeu a ler. Estou muito orgulhoso!",
                "Parabéns por dormir na sua cama. Você cresceu!",
                "Você cuidou muito bem do seu irmãozinho. Isso é ser um ajudante de verdade.",
                "Vi que você se esforçou na escola. Continue assim!",
            ]),
            ("h2", "Para quem pediu algo que não veio"),
            ("ul", [
                "Nem tudo cabe no trenó, mas o meu carinho por você cabe.",
                "Guardei o seu pedido no Grande Livro Dourado. Às vezes os pedidos demoram um pouquinho.",
                "Escolhi este presente pensando no seu sorriso.",
                "O melhor presente que você tem já mora com você: a sua família.",
            ]),
            ("h2", "Quer mais do que um bilhete?"),
            ("p", "Um bilhete tem duas linhas. A carta personalizada tem o nome, a cidade, as conquistas e uma missão secreta, e ainda pode ser lida pela voz do Papai Noel."),
            CRIAR,
            ("dica", "Escreva com a mão que você não usa ou em letra de forma bem caprichada. Criança reconhece a letra dos pais mais rápido do que a gente imagina."),
        ],
        "faq": [
            ("Onde deixar o bilhete?", "No laço do presente, pendurado na árvore, ao lado do prato de biscoitos ou no travesseiro."),
            ("Com que papel fazer?", "Um papel mais grosso, de cor creme ou kraft, dá um ar de Polo Norte. Um carimbo ou adesivo dourado completa."),
        ],
    },
    {
        "slug": "frases-do-papai-noel",
        "title": "Frases do Papai Noel para Crianças: 30 Ideias Curtas",
        "desc": "30 frases do Papai Noel para falar, escrever em cartões, usar em vídeos e legendas. Frases curtas, carinhosas e divertidas para o Natal das crianças.",
        "h1": "Frases do Papai Noel para crianças: 30 ideias curtas",
        "lead": "Para quem vai se vestir de Papai Noel, escrever um cartão ou legendar a foto da família: frases prontas no jeitinho do bom velhinho.",
        "emoji": "🎅",
        "blocks": [
            ("h2", "Frases clássicas"),
            ("ul", [
                "Ho, ho, ho! Feliz Natal!",
                "Quem foi bonzinho neste ano levanta a mão!",
                "Eu vim lá do Polo Norte só para ver você.",
                "As renas mandaram um beijo.",
                "Li a sua cartinha com muito carinho.",
                "A magia do Natal mora no coração de quem acredita.",
                "Durma cedo, que hoje eu passo na sua casa.",
                "O seu nome está na minha lista, bem no começo.",
                "Feliz Natal para você e para toda a sua família.",
                "No ano que vem eu volto!",
            ]),
            ("h2", "Frases carinhosas"),
            ("ul", [
                "Eu tenho muito orgulho de você.",
                "O melhor presente é ter quem a gente ama por perto.",
                "Ser gentil é o superpoder mais forte que existe.",
                "Você cresceu muito desde o último Natal.",
                "Um abraço bem apertado vale mais do que qualquer brinquedo.",
                "Cuide bem do seu coração, que ele é precioso.",
                "Dividir é multiplicar a alegria.",
                "Obrigado por espalhar sorrisos por onde passa.",
                "Não precisa ser perfeito. Basta tentar de novo.",
                "Eu acredito em você.",
            ]),
            ("h2", "Frases engraçadas"),
            ("ul", [
                "Quase fiquei entalado na chaminé. Preciso maneirar no panetone!",
                "O Rodolfo espirrou e acendeu a oficina inteira.",
                "Os duendes embrulharam o meu gorro por engano.",
                "No Brasil eu troco a bota pelo chinelo. Que calor!",
                "A Mamãe Noel escondeu os biscoitos de mim.",
                "Estacionei o trenó em cima do telhado. Tem problema?",
                "Minha barba é de verdade. Pode puxar, mas devagar!",
                "A rena Cometa pediu para ir no banco da frente.",
                "Eu não ronco. Quem ronca são as renas.",
                "Trouxe neve, mas ela derreteu no caminho.",
            ]),
            ("h2", "Frases com o nome da criança"),
            ("p", "Nenhuma frase pronta emociona tanto quanto ouvir o próprio nome. Na carta personalizada e na <a href=\"/ligacao-do-papai-noel\">ligação do Papai Noel</a>, ele chama a criança pelo nome e fala do ano dela."),
            CRIAR,
        ],
        "faq": [
            ("Posso usar as frases em vídeos e cartões?", "Pode, elas são livres para copiar e adaptar."),
            ("Como imitar a voz do Papai Noel?", "Fale devagar, com a voz mais grave e sorrindo. E capriche no “ho, ho, ho” vindo da barriga."),
        ],
    },
    {
        "slug": "desenhos-de-natal-para-colorir",
        "title": "Desenhos de Natal para Colorir Online e para Imprimir",
        "desc": "Desenhos de Natal para colorir: Papai Noel, árvore, renas e presentes. Pinte no celular com pincel de brilho e adesivos, baixe e mande no WhatsApp.",
        "h1": "Desenhos de Natal para colorir online",
        "lead": "Uma atividade tranquila para os dias de chuva, para a espera do jantar e para as férias: colorir desenhos de Natal direto na tela, sem sujar a mesa.",
        "emoji": "🖍️",
        "blocks": [
            ("h2", "O Ateliê de Natal"),
            ("ul", [
                "Vários desenhos de Natal para escolher.",
                "Paleta de cores, pincel de brilho, adesivos e borracha.",
                "Funciona com o dedo no celular e no tablet.",
                "No fim, é só baixar a imagem ou compartilhar no WhatsApp.",
            ]),
            ("cta", ("Abrir o Ateliê de Natal", "/#atelie")),
            ("h2", "Ideias para aproveitar os desenhos"),
            ("ol", [
                "<b>Cartão para os avós</b>: a criança pinta e você manda a imagem com um áudio dela.",
                "<b>Galeria da família</b>: imprima as obras e pendure num varal com pregadores.",
                "<b>Desenho para o Papai Noel</b>: deixe impresso na janela na noite de Natal.",
                "<b>Enfeite da árvore</b>: imprima pequeno, recorte e cole em papelão.",
            ]),
            ("h2", "Por que colorir faz bem"),
            ("ul", [
                "Treina a coordenação motora fina, importante para a escrita.",
                "Ajuda a criança a se acalmar e a se concentrar.",
                "Estimula a escolha e a combinação de cores.",
                "Dá à criança a alegria de terminar algo e mostrar para a família.",
            ]),
            ("dica", "Prefere papel e lápis de cor? Baixe também o <a href=\"/papel-timbrado-carta-papai-noel\">papel timbrado do Polo Norte</a>, que tem um quadro para a criança desenhar."),
        ],
        "faq": [
            ("Colorir no site é grátis?", "Sim."),
            ("A partir de que idade?", "A partir dos 3 anos, com a ajuda de um adulto para escolher as cores."),
            ("Dá para imprimir o desenho pintado?", "Sim. Baixe a imagem e imprima normalmente."),
        ],
    },
    {
        "slug": "o-que-pedir-para-o-papai-noel",
        "title": "O que Pedir para o Papai Noel: Ideias de Pedidos por Idade",
        "desc": "Seu filho não sabe o que pedir para o Papai Noel? Veja ideias de pedidos por idade, pedidos que não são brinquedos e como lidar com pedidos impossíveis.",
        "h1": "O que pedir para o Papai Noel: ideias por idade",
        "lead": "A lista de pedidos é uma boa conversa sobre desejo, escolha e gratidão. Veja ideias para ajudar a criança a pensar, sem transformar o Natal numa lista de compras.",
        "emoji": "🎄",
        "blocks": [
            ("h2", "Ideias por idade"),
            ("ul", [
                "<b>De 1 a 3 anos</b>: blocos de montar grandes, livros de banho, instrumentos musicais de brinquedo, bola.",
                "<b>De 4 a 6 anos</b>: massinha, kit de pintura, quebra-cabeça, fantasia, bicicleta com rodinhas, bonecos e bonecas.",
                "<b>De 7 a 9 anos</b>: jogos de tabuleiro, kit de ciências, livros de aventura, patins, material de desenho.",
                "<b>De 10 a 12 anos</b>: jogos de estratégia, instrumento musical, material esportivo, livros em série, kit de robótica.",
            ]),
            ("h2", "Pedidos que não são brinquedos"),
            ("ul", [
                "Um passeio só com o pai ou com a mãe.",
                "Uma noite de acampamento na sala.",
                "Aprender algo novo: nadar, cozinhar, tocar violão.",
                "Algo para outra pessoa: saúde para o avô, um brinquedo para uma criança que não tem.",
            ]),
            ("h2", "A regra dos quatro presentes"),
            ("p", "Muitas famílias usam esta regra para evitar exageros: <b>algo que eu quero, algo que eu preciso, algo para vestir e algo para ler</b>. Ela ajuda a criança a pensar antes de pedir."),
            ("h2", "E os pedidos impossíveis?"),
            ("ul", [
                "<b>Caro demais</b>: explique que o trenó tem espaço limitado e que o Papai Noel escolhe o que cabe.",
                "<b>Um animal de estimação</b>: diga que seres vivos precisam ser decididos pela família inteira.",
                "<b>Algo que não se compra</b> (alguém voltar, os pais não brigarem): acolha, escute e converse com carinho. Esse pedido é um recado para os adultos.",
            ]),
            ("p", "Na carta da Carta Mágica o Papai Noel <b>nunca promete</b> o presente: ele diz que anotou o pedido no Grande Livro Dourado."),
            CRIAR,
        ],
        "faq": [
            ("Quantos presentes a criança pode pedir?", "Não há regra. Entre um e três pedidos é uma boa medida, para a criança aprender a escolher."),
            ("E se ela mudar de ideia depois de escrever a carta?", "Acontece muito. Explique que o Papai Noel já anotou e que surpresas fazem parte do Natal."),
        ],
    },
    {
        "slug": "presente-de-natal-criativo-para-criancas",
        "title": "Presente de Natal Criativo e Barato para Crianças",
        "desc": "Presente de Natal criativo e barato para crianças: experiências, kits feitos em casa e presentes personalizados com o nome da criança, alguns de graça.",
        "h1": "Presente de Natal criativo e barato para crianças",
        "lead": "O presente de que a criança mais se lembra depois nem sempre é o mais caro. Costuma ser aquele que tem o nome dela, uma história ou um tempo junto com você.",
        "emoji": "🎀",
        "blocks": [
            ("h2", "Presentes personalizados"),
            ("ul", [
                "<b>Carta do Papai Noel com o nome dela</b>: grátis, pronta em 2 minutos.",
                "<b>Ligação do Papai Noel</b>: ele chama a criança pelo nome. Custa R$ 5,90.",
                "<b>Certificado de bom comportamento</b>, para pendurar no quarto.",
                "<b>Cartão de Natal com a foto da família</b>, para colocar num porta-retratos.",
            ]),
            CRIAR,
            ("h2", "Presentes de experiência"),
            ("ul", [
                "Vale-passeio: um dia inteiro escolhido pela criança.",
                "Vale-cinema em casa, com pipoca e cabana de lençol.",
                "Vale-cozinha: fazer biscoitos juntos, do começo ao fim.",
                "Vale-dormir mais tarde, uma vez.",
            ]),
            ("h2", "Kits feitos em casa"),
            ("ul", [
                "<b>Kit artista</b>: papéis, lápis, cola e tesoura sem ponta numa caixa decorada.",
                "<b>Kit cientista</b>: lupa, potinhos, ímã e um caderno de descobertas.",
                "<b>Kit jardineiro</b>: vasinho, terra e sementes de girassol.",
                "<b>Caixa de fantasias</b>: roupas e acessórios antigos da família.",
            ]),
            ("h2", "Como embrulhar com capricho gastando pouco"),
            ("ol", [
                "Use papel kraft e barbante.",
                "Carimbe com batata cortada em forma de estrela.",
                "Prenda um raminho verde no laço.",
                "Coloque um <a href=\"/bilhete-do-papai-noel\">bilhete do Papai Noel</a> com o nome da criança.",
            ]),
            ("dica", "Presente de última hora? A carta e a ligação ficam prontas na hora e não dependem de entrega."),
        ],
        "faq": [
            ("Qual presente posso dar sem gastar nada?", "A carta grátis do Papai Noel, um vale-experiência feito à mão ou um kit montado com o que há em casa."),
            ("Presente personalizado demora?", "Os digitais ficam prontos em minutos."),
        ],
    },
    {
        "slug": "lembrancinha-de-natal-para-criancas",
        "title": "Lembrancinha de Natal para Crianças: Ideias Simples e Baratas",
        "desc": "Lembrancinhas de Natal para crianças da escola, da igreja, dos primos e dos vizinhos: ideias simples e baratas para fazer em casa, com passo a passo.",
        "h1": "Lembrancinha de Natal para crianças: ideias simples e baratas",
        "lead": "Para a turma da escola, para os primos ou para as crianças do prédio: lembrancinhas que cabem no bolso e que as crianças ajudam a fazer.",
        "emoji": "🧁",
        "blocks": [
            ("h2", "Lembrancinhas para comer"),
            ("ul", [
                "Saquinho de biscoitos amanteigados com fita vermelha.",
                "Pote de “chocolate quente do Papai Noel”: achocolatado, leite em pó e minimarshmallows em camadas.",
                "Pirulito de chocolate em forma de estrela.",
                "Pipoca doce num cone de papel.",
            ]),
            ("p", "Antes de distribuir comida, pergunte aos responsáveis sobre alergias e restrições alimentares."),
            ("h2", "Lembrancinhas para brincar"),
            ("ul", [
                "Massinha caseira em potinho, nas cores do Natal.",
                "Kit de colorir: um desenho de Natal impresso e três gizes de cera.",
                "Enfeite de árvore de feltro ou de palito de sorvete.",
                "Comida das renas: aveia e granulado num saquinho, para deixar na janela.",
            ]),
            ("h2", "Lembrancinha com o nome de cada criança"),
            ("p", "Uma etiqueta com o nome já muda tudo. Para um grupo pequeno, como os primos, dá para ir além: uma carta do Papai Noel para cada um, impressa e enrolada como pergaminho."),
            CRIAR,
            ("h2", "Passo a passo do pergaminho"),
            ("ol", [
                "Crie a carta de cada criança com o nome e uma conquista do ano.",
                "Imprima em papel creme.",
                "Enrole, amarre com fita e cole um adesivo dourado.",
                "Entregue numa cesta, como se tivesse chegado do Polo Norte.",
            ]),
            ("dica", "Chame as crianças para montar os saquinhos. Preparar a lembrancinha para os outros ensina generosidade."),
        ],
        "faq": [
            ("Quanto custa uma lembrancinha simples?", "Feita em casa, costuma sair por poucos reais por criança. A carta grátis do Papai Noel só tem o custo da impressão."),
            ("O que escrever na etiqueta?", "O nome da criança e uma frase curta, como “Feliz Natal! Com carinho, família Souza”."),
        ],
    },
    {
        "slug": "tradicoes-de-natal-em-familia",
        "title": "Tradições de Natal em Família: 20 Ideias para Começar Neste Ano",
        "desc": "20 tradições de Natal para criar com as crianças: montar a árvore juntos, carta do Papai Noel, calendário do advento, noite do pijama, amigo secreto e mais.",
        "h1": "Tradições de Natal em família: 20 ideias para começar neste ano",
        "lead": "As crianças esquecem os presentes, mas se lembram por toda a vida do que a família fazia todo ano. Escolha duas ou três e repita sempre.",
        "emoji": "🕯️",
        "blocks": [
            ("h2", "Antes do Natal"),
            ("ol", [
                "Montar a árvore no mesmo dia todos os anos, com música.",
                "Comprar ou fazer um enfeite novo por ano, com a data atrás.",
                "Escrever a carta para o Papai Noel juntos.",
                "Abrir uma janela do <a href=\"/calendario-do-advento-infantil\">calendário do advento</a> por dia.",
                "Separar brinquedos em bom estado para doar.",
                "Fazer biscoitos e decorar com glacê.",
                "Passear de noite para ver as luzes da cidade.",
                "Sessão de filme de Natal com pipoca e cobertor.",
            ]),
            ("h2", "Na véspera"),
            ("ol", [
                "Pijamas novos ou combinando para todo mundo.",
                "Ler a carta do Papai Noel em voz alta, com a árvore acesa.",
                "Deixar o lanche do Papai Noel e a cenoura das renas.",
                "Cada pessoa diz na ceia uma coisa pela qual é grata.",
                "Tirar a foto da família no mesmo lugar todos os anos.",
                "Uma história antes de dormir, sempre a mesma.",
            ]),
            ("h2", "No dia de Natal e depois"),
            ("ol", [
                "Café da manhã especial, de pijama.",
                "Abrir os presentes um de cada vez, para todo mundo ver.",
                "Ligar para os parentes que estão longe.",
                "Escrever cartões de agradecimento por cada presente.",
                "Guardar a carta do ano numa caixa de lembranças.",
                "No dia 6 de janeiro, desmontar a árvore juntos e escolher um desejo para o ano.",
            ]),
            ("h2", "Uma tradição nova: a árvore da família"),
            ("p", "Na Árvore de Natal da Família, cada pessoa pendura um enfeite com uma frase de carinho, mesmo de longe, pelo link do WhatsApp. Na noite de Natal, o Modo Ceia mostra as frases na tela."),
            ("cta", ("Montar a árvore da família", "/#arvore")),
            ("dica", "Tradição boa é a que cabe na rotina. Uma simples, repetida todo ano, vale mais do que dez que cansam todo mundo."),
        ],
        "faq": [
            ("Com que idade começar as tradições?", "Desde o primeiro Natal. O bebê não vai lembrar, mas as fotos e a carta ficam."),
            ("E quando a família é pequena?", "Tradição não depende de quantidade. Mãe e filho montando a árvore juntos todo ano já é uma tradição linda."),
        ],
    },
    {
        "slug": "vespera-de-natal-com-criancas",
        "title": "Véspera de Natal com Crianças: Roteiro para uma Noite Mágica",
        "desc": "Um roteiro hora a hora para a véspera de Natal com crianças: atividades da tarde, ceia, carta do Papai Noel, lanche das renas e a hora de dormir sem briga.",
        "h1": "Véspera de Natal com crianças: roteiro para uma noite mágica",
        "lead": "O dia 24 é o mais longo do ano para uma criança. Com um roteiro simples, a ansiedade vira brincadeira e a noite termina em paz.",
        "emoji": "🌙",
        "blocks": [
            ("h2", "Durante a tarde"),
            ("ul", [
                "Gastar energia: parque, piscina, bicicleta ou uma caça ao tesouro.",
                "Preparar juntos os biscoitos do Papai Noel.",
                "Um cochilo para os pequenos, se a ceia for tarde.",
                "Banho e pijama especial antes de as visitas chegarem.",
            ]),
            ("h2", "No começo da noite"),
            ("ol", [
                "Acender a árvore e apagar as outras luzes.",
                "Olhar o <a href=\"/rastreador-do-papai-noel\">rastreador do Papai Noel</a>: “ele ainda está longe”.",
                "Ler a carta do Papai Noel em voz alta, ou deixar que ele mesmo leia.",
                "Jantar. Sirva algo de que a criança goste, mesmo que não seja o prato da ceia.",
            ]),
            CRIAR,
            ("h2", "Antes de dormir"),
            ("ol", [
                "Arrumar o prato de biscoitos, o copo de leite e a cenoura das renas.",
                "Deixar na janela um desenho ou um bilhete para o Papai Noel.",
                "Ler uma <a href=\"/historia-de-natal-para-criancas\">história de Natal</a> na cama.",
                "Combinar: ele só passa onde as crianças estão dormindo.",
            ]),
            ("h2", "Depois que elas dormem"),
            ("ul", [
                "Morda os biscoitos, beba metade do leite e deixe só a ponta da cenoura.",
                "Coloque os presentes e um <a href=\"/bilhete-do-papai-noel\">bilhete do Papai Noel</a>.",
                "Deixe uma “pegada” com farinha perto da janela.",
                "Carregue o celular para filmar a manhã seguinte.",
            ]),
            ("dica", "Se a ceia da família termina muito tarde, não force. O Papai Noel também pode passar enquanto a criança dorme na casa da avó."),
        ],
        "faq": [
            ("A que horas colocar a criança para dormir?", "O mais perto possível do horário normal. Criança descansada aproveita muito mais a manhã de Natal."),
            ("Abrir os presentes à meia-noite ou de manhã?", "As duas tradições existem no Brasil. Com crianças pequenas, a manhã do dia 25 costuma ser mais tranquila."),
        ],
    },
    {
        "slug": "atividades-de-natal-para-educacao-infantil",
        "title": "Atividades de Natal para Educação Infantil: 15 Ideias",
        "desc": "15 atividades de Natal para a educação infantil e os primeiros anos: escrita, artes, música, movimento e solidariedade, com materiais simples e baratos.",
        "h1": "Atividades de Natal para educação infantil: 15 ideias",
        "lead": "Ideias testadas em sala de aula e em casa, para crianças de 3 a 7 anos, que usam o que a escola já tem no armário.",
        "emoji": "✂️",
        "blocks": [
            ("h2", "Linguagem e escrita"),
            ("ol", [
                "<b>Carta para o Papai Noel</b>: os menores ditam e desenham, os maiores escrevem.",
                "<b>Caixa de correio da turma</b>: uma caixa de sapato vira o correio do Polo Norte.",
                "<b>Palavras do Natal</b>: cartões com figura e palavra, como estrela, sino, rena e árvore.",
                "<b>História coletiva</b>: cada criança inventa uma frase e a professora escreve.",
            ]),
            ("h2", "Artes"),
            ("ol", [
                "<b>Árvore de mãozinhas</b>: carimbos das mãos em tinta verde formam a árvore da turma.",
                "<b>Rena de pregador</b>: pregador de roupa, olhinhos e um pompom vermelho.",
                "<b>Guirlanda de prato de papel</b>: recorte o centro e cole papéis picados.",
                "<b>Cartão para a família</b>: com o desenho da criança na capa.",
                "<b>Colorir no tablet</b>: os <a href=\"/desenhos-de-natal-para-colorir\">desenhos de Natal para colorir</a> funcionam na lousa digital.",
            ]),
            ("h2", "Música e movimento"),
            ("ol", [
                "<b>Estátua de Natal</b>: quando a música para, todos viram boneco de neve.",
                "<b>Trenó em fila</b>: as crianças formam o trenó e as renas e percorrem um circuito.",
                "<b>Banda de sininhos</b>: guizos e chocalhos acompanham as canções.",
            ]),
            ("h2", "Valores e solidariedade"),
            ("ol", [
                "<b>Árvore da gentileza</b>: a cada boa ação, um enfeite de papel vai para a árvore.",
                "<b>Campanha de doação</b>: brinquedos e livros em bom estado para outra instituição.",
                "<b>Amigo secreto de desenho</b>: cada um desenha para o colega sorteado.",
            ]),
            ("h2", "Fechamento: a resposta do Papai Noel"),
            ("p", "No último dia, cada criança recebe uma resposta com o próprio nome. Veja como organizar em <a href=\"/carta-do-papai-noel-para-alunos\">carta do Papai Noel para alunos</a>."),
            CRIAR,
            ("dica", "Sempre avise as famílias sobre o projeto e ofereça uma atividade equivalente para as crianças que não comemoram o Natal."),
        ],
        "faq": [
            ("Quais atividades servem para o maternal?", "As de carimbo, música e movimento. Evite peças pequenas com crianças menores de 3 anos."),
            ("Como trabalhar o Natal respeitando as diferentes crenças?", "Foque em valores comuns, como gentileza, gratidão e partilha, e converse antes com as famílias."),
        ],
    },
    {
        "slug": "arvore-de-natal-virtual-da-familia",
        "title": "Árvore de Natal Virtual da Família: Monte Online com Quem Está Longe",
        "desc": "Monte uma árvore de Natal virtual com a família: cada pessoa pendura um enfeite com uma frase de carinho pelo link do WhatsApp. Com Modo Ceia para a noite de Natal.",
        "h1": "Árvore de Natal virtual da família",
        "lead": "Para as famílias espalhadas por várias cidades: uma árvore só, enfeitada por todos, que acende na tela na hora da ceia.",
        "emoji": "🌟",
        "blocks": [
            ("h2", "Como funciona"),
            ("ol", [
                "Você cria a árvore e dá um nome a ela, como “Natal dos Oliveira”.",
                "Pendura o primeiro enfeite e escreve uma frase de carinho, se quiser.",
                "Envia o link no grupo da família.",
                "Avós, tios e primos abrem o link e penduram os enfeites deles.",
                "Na noite de Natal, o Modo Ceia mostra as frases na tela, uma a uma.",
            ]),
            ("cta", ("Montar a árvore da família", "/#arvore")),
            ("h2", "Ideias de frases para os enfeites"),
            ("ul", [
                "“Obrigada por cada almoço de domingo.”",
                "“Vô, o seu abraço é o meu lugar preferido.”",
                "“Neste ano a gente passou por muita coisa, e passou junto.”",
                "“Saudade de quem não está mais aqui, mas continua na nossa mesa.”",
                "“Que no ano que vem a gente se veja mais.”",
            ]),
            ("h2", "Na noite de Natal"),
            ("p", "Ligue o celular ou o computador na TV e ative o Modo Ceia antes do brinde. As frases aparecem aos poucos, e cada pessoa descobre o que os outros escreveram. Costuma ser o momento mais emocionante da noite."),
            ("h2", "Cuidados"),
            ("ul", [
                "Quem tem o link pode adicionar enfeites, então compartilhe só com a família.",
                "Só quem criou a árvore pode retirar enfeites.",
                "Evite escrever dados pessoais nas frases, como endereço e telefone.",
            ]),
            ("dica", "Peça para as crianças escolherem o enfeite e ditarem a frase. As delas costumam ser as mais engraçadas e as mais sinceras."),
        ],
        "faq": [
            ("Precisa instalar aplicativo?", "Não. A árvore abre no navegador, pelo link."),
            ("A árvore virtual é grátis?", "Você pode criar e enfeitar a árvore pelo site. Alguns recursos extras fazem parte dos planos."),
            ("Quantas pessoas podem participar?", "Todos que receberem o link."),
        ],
    },
]


HUB = {
    "slug": "guia-de-natal",
    "title": "Guia de Natal para Pais: Cartas, Jogos e Ideias para as Crianças",
    "desc": "Tudo para um Natal mágico com as crianças: carta do Papai Noel personalizada, para imprimir e com voz, certificado, calendário do advento, jogos e ideias em família.",
    "h1": "Guia de Natal para pais",
    "lead": "Cartas do Papai Noel, brincadeiras e ideias para deixar o Natal das crianças inesquecível.",
    "emoji": "🎄",
}

# ------------------------------------------------------------------ modelo
CSS = """
:root{--bg:#060B19;--card:#0F1A36;--line:rgba(255,255,255,.12);--gold:#FFD166;--red:#D90429;--txt:#EDF2F4;--mut:rgba(237,242,244,.75)}
*{box-sizing:border-box}html{scroll-behavior:smooth;background:#060B19}
body{margin:0;background:radial-gradient(ellipse at 50% -10%,#1C2B5A 0%,var(--bg) 55%) fixed;color:var(--txt);font:16px/1.7 'Plus Jakarta Sans',system-ui,sans-serif}
a{color:var(--gold)}
.wrap{max-width:860px;margin:0 auto;padding:0 18px}
header{position:sticky;top:0;z-index:5;background:rgba(6,11,25,.88);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;height:62px}
.logo{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font:800 18px Cinzel,Georgia,serif}
.logo span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--red);font-size:20px}
.btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#D90429,#EF233C);color:#fff;font-weight:800;text-decoration:none;border:1px solid rgba(255,209,102,.6);border-radius:999px;padding:12px 22px;box-shadow:0 8px 24px -8px rgba(217,4,41,.7)}
.btn.sm{padding:8px 16px;font-size:14px}
nav.crumbs{font-size:13px;color:var(--mut);margin:22px 0 0}nav.crumbs a{color:var(--mut)}
.hero{padding:26px 0 8px;text-align:center}
.hero .em{font-size:52px}
h1{font:800 clamp(28px,5vw,44px)/1.15 Cinzel,Georgia,serif;margin:8px 0 14px}
.lead{font-size:18px;color:var(--mut);max-width:680px;margin:0 auto 22px}
article{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:clamp(20px,4vw,40px);margin:26px 0}
h2{font:700 clamp(21px,3vw,27px)/1.25 Cinzel,Georgia,serif;color:#fff;margin:34px 0 10px}
article h2:first-child{margin-top:0}
p,li{color:#DCE3EA}ul,ol{padding-left:22px}li{margin:6px 0}b{color:#fff}
.carta{background:#FCF9F2;color:#2B2118;border:4px solid var(--gold);border-radius:20px;padding:22px 24px;font:17px/1.75 Lora,Georgia,serif;margin:16px 0;transform:rotate(-.6deg);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)}
.carta p{color:#2B2118;margin:0 0 10px}.carta p:first-child{font:700 24px/1.2 'Mountains of Christmas',Lora,serif;color:#9B021A}
.carta .sig{text-align:right;font:32px 'Great Vibes',cursive;color:#9B021A;margin:0}
.dica{background:rgba(255,209,102,.1);border:1px dashed rgba(255,209,102,.6);border-radius:16px;padding:14px 18px;margin:18px 0}
.cta{text-align:center;margin:26px 0 8px}
.faq details{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin:10px 0}
.faq summary{cursor:pointer;font-weight:800;color:#fff}
.rel{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin:14px 0 30px}
.rel a{display:block;text-decoration:none;color:var(--txt);background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
.rel a:hover{border-color:var(--gold)}.rel b{display:block;color:#fff;margin-bottom:2px}.rel small{color:var(--mut)}
footer{border-top:1px solid var(--line);padding:26px 0 40px;color:var(--mut);font-size:14px;text-align:center}
footer a{color:var(--mut);margin:0 8px}
"""

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Great+Vibes&family=Lora:wght@400;700&family=Mountains+of+Christmas:wght@700&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">'
ICON = "<link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎅</text></svg>\" />"

esc = lambda s: html.escape(s, quote=True)


def head(title, desc, slug, ld):
    url = f"{SITE}/{slug}" if slug else SITE + "/"
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{esc(title)} | Carta Mágica</title>
<meta name="description" content="{esc(desc)}" />
<link rel="canonical" href="{url}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#060B19" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="Carta Mágica" />
<meta property="og:title" content="{esc(title)}" />
<meta property="og:description" content="{esc(desc)}" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{SITE}/og-carta.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
{ICON}
{FONTS}
<style>{CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>"""


def top():
    return """<body>
<header><div class="wrap">
<a class="logo" href="/"><span>🎅</span>Carta Mágica</a>
<a class="btn sm" href="/#criar">✨ Criar carta grátis</a>
</div></header>
<main class="wrap">"""


def bottom(current):
    i = next((k for k, p in enumerate(PAGES) if p["slug"] == current), 0)
    near = [PAGES[(i + d) % len(PAGES)] for d in (1, 2, 3, 4, 5, 6)]
    links = "".join(
        f'<a href="/{p["slug"]}"><b>{p["emoji"]} {esc(p["h1"].split(":")[0])}</b><small>{esc(p["desc"][:90])}…</small></a>'
        for p in near
    )
    return f"""<h2>Veja também</h2>
<div class="rel">{links}</div>
</main>
<footer><div class="wrap">
<p><a href="/">Início</a><a href="/guia-de-natal">Guia de Natal (todas as páginas)</a><a href="/#precos">Planos</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos</a></p>
<p>🎄 Carta Mágica · cartas personalizadas do Papai Noel · cartamagicanatal.com.br</p>
</div></footer>
</body></html>"""


def block(b):
    k, v = b
    if k == "h2":
        return f"<h2>{esc(v)}</h2>"
    if k == "p":
        return f"<p>{v}</p>"
    if k in ("ul", "ol"):
        return f"<{k}>" + "".join(f"<li>{i}</li>" for i in v) + f"</{k}>"
    if k == "carta":
        return '<div class="carta">' + "".join(f"<p>{esc(x)}</p>" for x in v) + '<p class="sig">Papai Noel</p></div>'
    if k == "dica":
        return f'<div class="dica">💡 {v}</div>'
    if k == "cta":
        t, href = v
        return f'<div class="cta"><a class="btn" href="{href}">✨ {esc(t)}</a></div>'
    raise ValueError(k)


def page(p):
    url = f"{SITE}/{p['slug']}"
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": p["title"],
                "description": p["desc"],
                "inLanguage": "pt-BR",
                "mainEntityOfPage": url,
                "image": f"{SITE}/og-carta.jpg",
                "datePublished": "2026-11-01",
                "dateModified": TODAY,
                "author": {"@type": "Organization", "name": "Carta Mágica"},
                "publisher": {"@type": "Organization", "name": "Carta Mágica", "url": SITE},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Início", "item": SITE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Guia de Natal", "item": f"{SITE}/guia-de-natal"},
                    {"@type": "ListItem", "position": 3, "name": p["h1"], "item": url},
                ],
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]
                ],
            },
        ],
    }
    body = "".join(block(b) for b in p["blocks"])
    faq = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in p["faq"])
    return (
        head(p["title"], p["desc"], p["slug"], ld)
        + top()
        + f'<nav class="crumbs"><a href="/">Início</a> › <a href="/guia-de-natal">Guia de Natal</a> › {esc(p["h1"].split(":")[0])}</nav>'
        + f'<section class="hero"><div class="em">{p["emoji"]}</div><h1>{esc(p["h1"])}</h1><p class="lead">{esc(p["lead"])}</p><a class="btn" href="/#criar">✨ Criar minha carta grátis</a></section>'
        + f"<article>{body}</article>"
        + f'<article class="faq"><h2>Perguntas frequentes</h2>{faq}</article>'
        + bottom(p["slug"])
    )


def hub():
    h = HUB
    ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": h["title"],
        "description": h["desc"],
        "url": f"{SITE}/{h['slug']}",
        "inLanguage": "pt-BR",
        "hasPart": [{"@type": "Article", "name": p["title"], "url": f"{SITE}/{p['slug']}"} for p in PAGES],
    }
    cards = "".join(
        f'<a href="/{p["slug"]}"><b>{p["emoji"]} {esc(p["h1"])}</b><small>{esc(p["desc"])}</small></a>' for p in PAGES
    )
    return (
        head(h["title"], h["desc"], h["slug"], ld)
        + top()
        + f'<nav class="crumbs"><a href="/">Início</a> › Guia de Natal</nav>'
        + f'<section class="hero"><div class="em">{h["emoji"]}</div><h1>{esc(h["h1"])}</h1><p class="lead">{esc(h["lead"])}</p></section>'
        + '<div class="rel"><a href="/certificado"><b>🏅 Certificado da Lista dos Bonzinhos (grátis)</b><small>Gere na hora o certificado do Papai Noel com o nome da criança ou do pet, em azul, rosa ou vermelho, pronto para o WhatsApp e os Stories.</small></a></div>'
        + f'<div class="rel">{cards}</div>'
        + '<div class="cta"><a class="btn" href="/#criar">✨ Criar a carta do Papai Noel grátis</a></div>'
        + "</main><footer><div class=\"wrap\"><p><a href=\"/\">Início</a><a href=\"/#precos\">Planos</a><a href=\"/privacidade\">Privacidade</a><a href=\"/termos\">Termos</a></p><p>🎄 Carta Mágica · cartamagicanatal.com.br</p></div></footer></body></html>"
    )


def main():
    for p in PAGES:
        with open(os.path.join(OUT, f"{p['slug']}.html"), "w", encoding="utf-8") as f:
            f.write(page(p))
    with open(os.path.join(OUT, f"{HUB['slug']}.html"), "w", encoding="utf-8") as f:
        f.write(hub())
    urls = [("", "1.0", "daily"), (HUB["slug"], "0.8", "weekly"), ("certificado", "0.9", "weekly")] + [(p["slug"], "0.8", "weekly") for p in PAGES]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for slug, pr, fr in urls:
        sm += f"  <url><loc>{SITE}/{slug}</loc><lastmod>{TODAY}</lastmod><changefreq>{fr}</changefreq><priority>{pr}</priority></url>\n"
    sm += "</urlset>\n"
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sm)
    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")
    print(f"{len(PAGES) + 1} páginas, sitemap.xml e robots.txt gerados em public/")


if __name__ == "__main__":
    main()
