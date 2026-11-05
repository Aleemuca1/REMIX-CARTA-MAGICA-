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
    urls = [("", "1.0", "daily"), (HUB["slug"], "0.8", "weekly")] + [(p["slug"], "0.8", "weekly") for p in PAGES]
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
