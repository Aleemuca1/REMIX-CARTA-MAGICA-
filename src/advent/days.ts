/** Conteúdo das 24 portinhas do Calendário do Advento Mágico. */

export type DayActivity =
  | { type: "message"; from: string; text: string }
  | { type: "quiz"; question: string; options: string[]; answer: number; fact: string }
  | { type: "kindness"; challenge: string; tip: string }
  | { type: "memory"; pairs: number }
  | { type: "catch"; goal: number; seconds: number; golden?: boolean }
  | { type: "bells"; song: "jingle" | "silent" }
  | { type: "snowman" }
  | { type: "delivery" }
  | { type: "coloring"; design: string };

export type AdventDay = { day: number; emoji: string; title: string; activity: DayActivity };

// {nome} é trocado pelo nome da criança
export const ADVENT_DAYS: AdventDay[] = [
  { day: 1, emoji: "💌", title: "Uma carta chegou!", activity: { type: "message", from: "Papai Noel", text: "Ho Ho Ho, {nome}! Hoje começa a contagem regressiva mais mágica do ano. Todo dia uma portinha nova vai se abrir aqui no calendário, com jogos, desafios e surpresas que os duendes prepararam só para você. Cada portinha que você completar vira uma estrela no meu Livro Dourado. Vamos juntos até a noite de Natal?" } },
  { day: 2, emoji: "❄️", title: "Pegue os flocos", activity: { type: "catch", goal: 12, seconds: 20 } },
  { day: 3, emoji: "🤗", title: "Desafio da bondade", activity: { type: "kindness", challenge: "Dê um abraço bem apertado em alguém da sua família e diga o quanto você gosta dessa pessoa.", tip: "Abraços são o presente preferido do Papai Noel!" } },
  { day: 4, emoji: "🦌", title: "Adivinha do Polo Norte", activity: { type: "quiz", question: "Tenho o nariz vermelho que brilha no escuro e ajudo a guiar o trenó. Quem sou eu?", options: ["Um duende", "A rena Rudolph", "O boneco de neve"], answer: 1, fact: "O nariz do Rudolph ilumina o caminho nas noites de neblina!" } },
  { day: 5, emoji: "🧠", title: "Memória da Oficina", activity: { type: "memory", pairs: 6 } },
  { day: 6, emoji: "🔔", title: "Sininhos mágicos", activity: { type: "bells", song: "jingle" } },
  { day: 7, emoji: "⛄", title: "Monte seu boneco de neve", activity: { type: "snowman" } },
  { day: 8, emoji: "📜", title: "A lista dos duendes", activity: { type: "message", from: "Duende Chefe", text: "Olá, {nome}! Aqui é o Duende Chefe da oficina. Hoje passamos a tarde conferindo a Lista de Bondade, e o seu nome brilhou lá no alto! Continue sendo gentil que o Papai Noel está acompanhando tudo pelo telescópio de cristal." } },
  { day: 9, emoji: "🛷", title: "Entrega Relâmpago", activity: { type: "delivery" } },
  { day: 10, emoji: "🧸", title: "Desafio da bondade", activity: { type: "kindness", challenge: "Arrume os seus brinquedos sem ninguém pedir. Os duendes adoram ver tudo organizado!", tip: "Na oficina, cada brinquedo tem o seu cantinho." } },
  { day: 11, emoji: "🌍", title: "Adivinha do Polo Norte", activity: { type: "quiz", question: "Onde fica a casa e a oficina do Papai Noel?", options: ["No Polo Norte", "Na praia", "Na Lua"], answer: 0, fact: "No Polo Norte faz tanto frio que a neve dura o ano inteiro!" } },
  { day: 12, emoji: "🍪", title: "Pinte o biscoito de gengibre", activity: { type: "coloring", design: "biscoito" } },
  { day: 13, emoji: "🍪", title: "Receita da Mamãe Noel", activity: { type: "message", from: "Mamãe Noel", text: "Oi, {nome}! Vou contar o segredo dos meus biscoitos: farinha, manteiga, um pouquinho de mel, canela e muito, muito carinho. Peça para um adulto te ajudar e faça biscoitos em formato de estrela. Se sobrar um, o Papai Noel vai adorar provar na noite de Natal!" } },
  { day: 14, emoji: "🎁", title: "Memória dos presentes", activity: { type: "memory", pairs: 8 } },
  { day: 15, emoji: "🎨", title: "Desafio da bondade", activity: { type: "kindness", challenge: "Faça um desenho bem bonito e dê de presente para alguém que você ama.", tip: "Presentes feitos à mão têm um pozinho mágico especial." } },
  { day: 16, emoji: "🎶", title: "Noite Feliz nos sininhos", activity: { type: "bells", song: "silent" } },
  { day: 17, emoji: "🦌", title: "Adivinha do Polo Norte", activity: { type: "quiz", question: "Contando com o Rudolph, quantas renas puxam o trenó do Papai Noel?", options: ["3 renas", "9 renas", "20 renas"], answer: 1, fact: "São Rudolph, Corredora, Dançarina, Empinadora, Raposa, Cometa, Cupido, Trovão e Relâmpago!" } },
  { day: 18, emoji: "🧣", title: "Boneco de neve estiloso", activity: { type: "snowman" } },
  { day: 19, emoji: "💫", title: "Pinte a guirlanda", activity: { type: "coloring", design: "guirlanda" } },
  { day: 20, emoji: "💛", title: "Desafio da bondade", activity: { type: "kindness", challenge: "Diga “obrigado” e “por favor” pelo menos 5 vezes hoje.", tip: "Palavras gentis são como luzinhas de Natal: iluminam tudo." } },
  { day: 21, emoji: "✨", title: "Flocos dourados", activity: { type: "catch", goal: 18, seconds: 20, golden: true } },
  { day: 22, emoji: "🔨", title: "A oficina não para", activity: { type: "message", from: "Papai Noel", text: "{nome}, a oficina está a todo vapor! Os duendes trabalham dia e noite, as renas estão fazendo alongamento e eu já estou ensaiando o meu Ho Ho Ho mais bonito. Faltam só dois dias. Você está pronto para a noite mais mágica do ano?" } },
  { day: 23, emoji: "🏡", title: "Adivinha do Polo Norte", activity: { type: "quiz", question: "Por onde o Papai Noel costuma entrar nas casas para deixar os presentes?", options: ["Pela chaminé", "Pela garagem", "Pelo telhado de helicóptero"], answer: 0, fact: "E quando a casa não tem chaminé? Ele usa uma chave mágica que abre qualquer porta!" } },
  { day: 24, emoji: "🌟", title: "Véspera de Natal!", activity: { type: "message", from: "Papai Noel", text: "Querido(a) {nome}, chegou a noite mais esperada! Durante todos esses dias você foi carinhoso, corajoso e cheio de alegria. Cada estrela que você ganhou está guardada no meu Livro Dourado. Hoje, durma cedinho e sonhe bonito, porque o trenó já está pronto para decolar. Feliz Natal! Com todo o meu amor, Papai Noel." } },
];
