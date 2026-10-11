import { LEGAL as L } from "./config";

export type Block = { h: string; p?: string[]; li?: string[] };
export type LegalDoc = { slug: string; title: string; emoji: string; intro: string; blocks: Block[] };

export const TERMOS: LegalDoc = {
  slug: "termos",
  title: "Termos de Uso",
  emoji: "📜",
  intro: `Estes Termos de Uso regulam o uso do site ${L.marca} (${L.site}), mantido por ${L.responsavel}, inscrito(a) sob o nº ${L.documento}, com endereço em ${L.endereco}. Ao usar o site, você declara que leu e concorda com estes Termos e com a nossa Política de Privacidade.`,
  blocks: [
    {
      h: "1. O que é a Carta Mágica",
      p: [
        "A Carta Mágica é uma plataforma de entretenimento natalino em que pais, mães e responsáveis criam cartas personalizadas “do Papai Noel” para crianças, com ajuda de inteligência artificial. O site também oferece atividades lúdicas, como jogo, Ateliê de desenho, globo de neve e Calendário do Advento.",
        "O Papai Noel é um personagem do folclore natalino. As cartas são uma brincadeira criada pela família para a criança; a Carta Mágica não tem ligação com nenhuma entidade “oficial” do Polo Norte ou com qualquer marca de terceiros.",
      ],
    },
    {
      h: "2. Quem pode usar",
      li: [
        "O cadastro de informações e a compra de planos são exclusivos para pessoas maiores de 18 anos.",
        "Ao preencher dados de uma criança, você declara ser pai, mãe ou responsável legal por ela, ou ter autorização de quem é.",
        "As atividades (jogo, desenho, calendário) podem ser usadas por crianças, sempre com acompanhamento de um adulto.",
      ],
    },
    {
      h: "3. Conteúdo gerado por inteligência artificial",
      li: [
        "O texto das cartas e a narração em áudio são gerados automaticamente por inteligência artificial a partir das informações que você fornece.",
        "Embora façamos o possível para que o conteúdo seja carinhoso e adequado, ele pode conter erros ou frases inesperadas. Leia a carta antes de mostrá-la à criança.",
        "Se algum conteúdo parecer inadequado, gere uma nova carta e nos avise pelo e-mail " + L.email + ".",
      ],
    },
    {
      h: "4. Planos, preços e pagamento",
      li: [
        "A carta digital básica é gratuita. Os planos pagos (Magia Completa e Natal Completo) liberam recursos extras descritos na página de planos, pelos preços informados no momento da compra.",
        "Os pagamentos são processados pelo Asaas, intermediador de pagamentos. A Carta Mágica não recebe nem armazena os dados do seu cartão.",
        "Os recursos pagos são liberados após a confirmação do pagamento pelo intermediador.",
        "O Calendário do Advento libera uma portinha por dia, de 1º a 24 de dezembro. Comprar depois de 1º de dezembro dá acesso às portinhas já abertas e às seguintes.",
      ],
    },
    {
      h: "5. Arrependimento e reembolso",
      p: [
        "Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da compra em até 7 (sete) dias a contar da contratação. Para isso, escreva para " + L.email + " informando o e-mail e o código do pedido. O valor será devolvido pelo mesmo meio de pagamento, nos prazos do intermediador.",
      ],
    },
    {
      h: "6. Regras de uso",
      p: ["Ao usar o site, você se compromete a não:"],
      li: [
        "inserir conteúdo ofensivo, discriminatório, violento ou impróprio para crianças;",
        "informar dados de crianças sem autorização dos responsáveis;",
        "tentar acessar áreas restritas, sobrecarregar o sistema ou copiar o site de forma automatizada;",
        "usar o serviço para fins comerciais de terceiros sem nossa autorização.",
      ],
    },
    {
      h: "7. Propriedade intelectual",
      li: [
        "O site, a marca, o código, as ilustrações, os desenhos para colorir, os textos e as músicas sintetizadas pertencem a " + L.responsavel + " ou são usados com permissão.",
        "As cartas geradas e os desenhos feitos no Ateliê são seus, para uso pessoal e familiar. Você pode imprimi-los e compartilhá-los livremente.",
        "As melodias natalinas usadas no site (como “Jingle Bells” e “Noite Feliz”) são de domínio público.",
      ],
    },
    {
      h: "8. Links compartilháveis",
      p: [
        "Ao usar o botão “Compartilhar” da carta, é gerado um link próprio. Qualquer pessoa que tiver esse link poderá ver a carta, incluindo o nome e a cidade da criança. Compartilhe apenas com quem você confia.",
      ],
    },
    {
      h: "9. Disponibilidade e responsabilidade",
      li: [
        "Trabalhamos para manter o site no ar, mas ele pode passar por instabilidades, manutenções ou falhas de serviços de terceiros (hospedagem, inteligência artificial, pagamentos).",
        "Não nos responsabilizamos por danos decorrentes de uso indevido do site, de informações incorretas fornecidas pelo usuário ou de compartilhamento de links por ele.",
        "Nada nestes Termos limita os direitos garantidos a você pelo Código de Defesa do Consumidor.",
      ],
    },
    {
      h: "10. Alterações",
      p: ["Podemos atualizar estes Termos. A data da última atualização fica no topo da página. Mudanças importantes serão avisadas no site."],
    },
    {
      h: "11. Lei aplicável e contato",
      p: [
        "Estes Termos seguem as leis brasileiras. Fica eleito o foro do domicílio do consumidor para resolver eventuais conflitos.",
        "Dúvidas? Fale com a gente: " + L.email + ".",
      ],
    },
  ],
};

export const PRIVACIDADE: LegalDoc = {
  slug: "privacidade",
  title: "Política de Privacidade",
  emoji: "🔒",
  intro: `Esta Política explica como ${L.marca} (${L.responsavel}, ${L.documento}) coleta, usa e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Como o site envolve crianças, tratamos essas informações com cuidado redobrado.`,
  blocks: [
    {
      h: "1. Quais dados coletamos",
      p: ["Dados que você informa ao criar uma carta (sobre a criança):"],
      li: [
        "nome ou apelido da criança, idade e cidade/estado;",
        "conquistas do ano, pedido de presente e recado dos pais (campos opcionais);",
        "data e registro da sua autorização como responsável.",
      ],
    },
    {
      h: "",
      p: ["Dados de compra (quando houver pagamento):"],
      li: [
        "plano escolhido, valor, data e situação do pagamento;",
        "dados de identificação e cobrança informados diretamente ao Asaas. Os dados de cartão ficam somente com o intermediador; não temos acesso a eles.",
      ],
    },
    {
      h: "",
      p: ["Dados técnicos:"],
      li: [
        "endereço IP e informações do navegador, registrados automaticamente pelos nossos provedores de hospedagem para segurança e funcionamento;",
        "preferências salvas no seu próprio navegador (veja a Política de Cookies).",
      ],
    },
    {
      h: "2. Para que usamos os dados",
      li: [
        "Escrever a carta personalizada e gerar a narração em áudio;",
        "Guardar a carta para você poder abrir, imprimir e compartilhar o link;",
        "Liberar os recursos dos planos pagos e cumprir obrigações fiscais;",
        "Responder suas mensagens e pedidos de suporte;",
        "Manter a segurança do site e evitar abusos.",
      ],
      p: ["Não vendemos dados, não fazemos publicidade direcionada e não criamos perfis de crianças."],
    },
    {
      h: "3. Dados de crianças (art. 14 da LGPD)",
      li: [
        "Os dados da criança são tratados somente no melhor interesse dela e apenas para criar a experiência natalina pedida pela família.",
        "Antes de gerar a carta, pedimos o consentimento específico de pelo menos um dos pais ou do responsável legal.",
        "Pedimos apenas o mínimo necessário. Não peça nem informe sobrenome, escola, endereço, fotos ou dados de saúde da criança.",
        "O responsável pode pedir, a qualquer momento, a consulta, correção ou exclusão dos dados.",
      ],
    },
    {
      h: "4. Bases legais",
      li: [
        "Consentimento do responsável: dados da criança usados para criar a carta (art. 7º, I, e art. 14, §1º);",
        "Execução de contrato: entrega dos planos comprados (art. 7º, V);",
        "Cumprimento de obrigação legal: registros fiscais e de acesso (art. 7º, II);",
        "Legítimo interesse: segurança e prevenção a fraudes (art. 7º, IX).",
      ],
    },
    {
      h: "5. Com quem compartilhamos",
      p: ["Usamos fornecedores que nos ajudam a prestar o serviço (operadores). Eles só podem usar os dados para isso:"],
      li: [
        "Google (Gemini): inteligência artificial que escreve a carta e gera a voz. Recebe as informações da carta no momento da geração.",
        "Supabase: banco de dados onde as cartas e pedidos ficam guardados.",
        "Vercel: hospedagem do site.",
        "Asaas: processamento dos pagamentos.",
        "Google Fonts: fornece as fontes do site (recebe o endereço IP ao carregar a página).",
      ],
    },
    {
      h: "6. Transferência internacional",
      p: [
        "Alguns desses fornecedores podem armazenar ou processar dados em servidores fora do Brasil. Nesses casos, adotamos fornecedores com padrões de segurança reconhecidos, conforme o art. 33 da LGPD.",
      ],
    },
    {
      h: "7. Por quanto tempo guardamos",
      li: [
        "Cartas e dados da criança: até 12 meses após o Natal do ano em que foram criadas, ou antes, se você pedir a exclusão;",
        "Dados de pagamento e notas: pelo prazo exigido pela legislação fiscal;",
        "Registros de acesso: por 6 meses, conforme o Marco Civil da Internet.",
      ],
    },
    {
      h: "8. Segurança",
      p: [
        "Usamos conexão segura (HTTPS), banco de dados com controle de acesso e chaves de acesso guardadas somente no servidor. Nenhum sistema é 100% invulnerável. Se ocorrer um incidente relevante, avisaremos os titulares e a ANPD, conforme a lei.",
      ],
    },
    {
      h: "9. Seus direitos",
      p: ["Pelo art. 18 da LGPD, você pode pedir a qualquer momento:"],
      li: [
        "confirmação de que tratamos seus dados e acesso a eles;",
        "correção de dados incompletos ou errados;",
        "anonimização, bloqueio ou exclusão;",
        "portabilidade;",
        "informação sobre com quem compartilhamos;",
        "revogação do consentimento.",
      ],
    },
    {
      h: "",
      p: [
        `Para exercer seus direitos, escreva para ${L.emailPrivacidade}. Responderemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
      ],
    },
    {
      h: "10. Encarregado (DPO) e contato",
      p: [`Encarregado pelo tratamento de dados: ${L.encarregado} — ${L.emailPrivacidade}.`],
    },
    {
      h: "11. Alterações",
      p: ["Esta Política pode ser atualizada. A data da última versão fica no topo da página."],
    },
  ],
};

export const COOKIES: LegalDoc = {
  slug: "cookies",
  title: "Política de Cookies",
  emoji: "🍪",
  intro: `Esta Política explica como ${L.marca} usa cookies e tecnologias parecidas, como o armazenamento local do navegador.`,
  blocks: [
    {
      h: "1. O que são",
      p: [
        "Cookies e armazenamento local são pequenos dados que o site guarda no seu navegador para lembrar informações entre uma visita e outra.",
      ],
    },
    {
      h: "2. O que usamos",
      p: ["Hoje usamos apenas itens necessários para o funcionamento das atividades:"],
      li: [
        "carta-magica-advento — guarda quais portinhas do Calendário do Advento já foram completadas;",
        "carta-magica-advento-acesso — lembra se este navegador tem o plano Natal Completo;",
        "carta-magica-nome — nome da criança digitado no calendário ou no Ateliê, para não precisar digitar de novo;",
        "carta-magica-best — recorde do jogo Entrega Relâmpago;",
        "carta-magica-cookies — lembra que você já viu este aviso.",
      ],
    },
    {
      h: "",
      p: [
        "Esses dados ficam somente no seu navegador e não são enviados para nós.",
        "Não usamos cookies de publicidade nem de rastreamento entre sites.",
      ],
    },
    {
      h: "3. Serviços de terceiros",
      li: [
        "Google Fonts: ao carregar as fontes, o Google recebe o seu endereço IP.",
        "Asaas: na página de pagamento, o intermediador pode usar cookies próprios, conforme a política dele.",
      ],
    },
    {
      h: "4. Como apagar",
      p: [
        "Você pode apagar esses dados a qualquer momento nas configurações do navegador (opção “limpar dados de navegação” ou “cookies e dados do site”). Se fizer isso, o progresso do calendário e o recorde do jogo serão perdidos neste aparelho.",
        "Se no futuro passarmos a usar cookies de estatística ou marketing, vamos pedir sua permissão antes.",
      ],
    },
    {
      h: "5. Contato",
      p: [`Dúvidas: ${L.emailPrivacidade}.`],
    },
  ],
};

export const LEGAL_DOCS = { termos: TERMOS, privacidade: PRIVACIDADE, cookies: COOKIES };
