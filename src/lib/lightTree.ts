/**
 * Árvore de Luz: cada bolinha guarda uma mensagem de incentivo, um versículo da Bíblia
 * e uma ideia para fazer em família neste Natal (com a melhor época para fazer).
 * Versículos curtos, na linguagem das traduções de Almeida.
 */
export type Bauble = {
  color: string;
  message: string;
  verse: string;
  ref: string;
  idea: string;
  when: string;
  /** esta bolinha convida a escrever a carta */
  letter?: boolean;
};

export const BAUBLES: Bauble[] = [
  {
    color: "#E01E37",
    message: "Você é um presente na vida de quem está ao seu lado. Nunca se esqueça disso!",
    verse: "Porque um menino nos nasceu, um filho se nos deu.",
    ref: "Isaías 9:6",
    idea: "Leiam juntos a história do nascimento de Jesus em Lucas, capítulo 2.",
    when: "Na noite de 24, antes da ceia",
  },
  {
    color: "#FFD166",
    message: "A alegria que você espalha ilumina mais que qualquer pisca-pisca.",
    verse: "Não temais, porque eis que vos trago novas de grande alegria.",
    ref: "Lucas 2:10",
    idea: "Escreva sua cartinha para o Papai Noel contando seus sonhos e o que você aprendeu este ano.",
    when: "Agora mesmo! O trenó sai no dia 24",
    letter: true,
  },
  {
    color: "#2DC653",
    message: "Mesmo nos dias difíceis, você é mais forte do que imagina.",
    verse: "Tudo posso naquele que me fortalece.",
    ref: "Filipenses 4:13",
    idea: "Montem juntos o presépio e conversem sobre o significado de cada figura.",
    when: "No começo de dezembro",
  },
  {
    color: "#4CC9F0",
    message: "Cuidar dos outros é o jeito mais bonito de deixar o Natal acontecer.",
    verse: "Sede uns para com os outros benignos, misericordiosos.",
    ref: "Efésios 4:32",
    idea: "Separe um brinquedo ou uma roupa em bom estado para doar a uma criança.",
    when: "Na primeira semana de dezembro",
  },
  {
    color: "#B57BFF",
    message: "Você não está sozinho: há sempre alguém cuidando de você.",
    verse: "O Senhor é o meu pastor; nada me faltará.",
    ref: "Salmos 23:1",
    idea: "Liguem ou façam uma chamada de vídeo para os avós e cantem uma música de Natal.",
    when: "Num domingo à tarde",
  },
  {
    color: "#FF7AA2",
    message: "O amor que existe na sua família é o enfeite mais lindo da casa.",
    verse: "O amor é paciente, o amor é bondoso.",
    ref: "1 Coríntios 13:4",
    idea: "Façam biscoitos de Natal juntos e deem alguns para um vizinho.",
    when: "Num fim de semana de dezembro",
  },
  {
    color: "#F4A261",
    message: "Cada passo que você dá, por menor que seja, conta muito.",
    verse: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    ref: "Salmos 119:105",
    idea: "Façam uma caminhada à noite para ver as casas e ruas iluminadas.",
    when: "Numa noite da semana do Natal",
  },
  {
    color: "#E01E37",
    message: "Seu coração bondoso faz do mundo um lugar melhor.",
    verse: "Eu sou a luz do mundo.",
    ref: "João 8:12",
    idea: "Acendam uma vela na mesa e cada um conta uma coisa boa que aconteceu no ano.",
    when: "Na ceia de Natal",
  },
  {
    color: "#2DC653",
    message: "Agradecer abre espaço para coisas boas chegarem.",
    verse: "Toda boa dádiva e todo dom perfeito vêm do alto.",
    ref: "Tiago 1:17",
    idea: "Escrevam bilhetinhos de gratidão e escondam pela casa para a família encontrar.",
    when: "Durante o Advento (as 4 semanas antes do Natal)",
  },
  {
    color: "#FFD166",
    message: "Os seus sonhos importam. Continue sonhando grande!",
    verse: "Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.",
    ref: "Salmos 37:5",
    idea: "Peça ao Papai Noel, na sua cartinha, um desejo que não seja um brinquedo: um desejo para o mundo.",
    when: "Antes do dia 24",
    letter: true,
  },
  {
    color: "#4CC9F0",
    message: "Você é amado exatamente do jeito que você é.",
    verse: "Deixai vir a mim os pequeninos.",
    ref: "Marcos 10:14",
    idea: "Montem uma cabaninha na sala e assistam a um filme de Natal juntos.",
    when: "Numa sexta-feira à noite",
  },
  {
    color: "#B57BFF",
    message: "A paz começa com um abraço. Distribua muitos hoje!",
    verse: "Glória a Deus nas alturas, paz na terra aos homens a quem ele quer bem.",
    ref: "Lucas 2:14",
    idea: "Façam uma 'corrente do abraço': cada pessoa da casa abraça todas as outras.",
    when: "Na manhã de 25 de dezembro",
  },
  {
    color: "#FF7AA2",
    message: "Ser corajoso é tentar de novo, mesmo com medo.",
    verse: "Sê forte e corajoso; não temas, nem te espantes.",
    ref: "Josué 1:9",
    idea: "Desenhe um cartão de Natal para alguém que trabalha perto de você: o porteiro, a professora, o motorista.",
    when: "Na última semana de aula ou de trabalho",
  },
  {
    color: "#F4A261",
    message: "Hoje é um ótimo dia para ser feliz.",
    verse: "Este é o dia que fez o Senhor; regozijemo-nos e alegremo-nos nele.",
    ref: "Salmos 118:24",
    idea: "Coloquem uma música de Natal bem alto e dancem juntos na cozinha!",
    when: "Enquanto arrumam a casa para a ceia",
  },
  {
    color: "#2DC653",
    message: "Quem compartilha nunca fica com as mãos vazias.",
    verse: "Graças a Deus pelo seu dom inefável.",
    ref: "2 Coríntios 9:15",
    idea: "Preparem juntos uma cesta de Natal para uma família que precisa.",
    when: "Até o dia 20 de dezembro",
  },
  {
    color: "#E01E37",
    message: "O Natal mora dentro de você o ano inteiro.",
    verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho.",
    ref: "João 3:16",
    idea: "Guarde a cartinha do Papai Noel deste ano numa caixa de memórias para ler no próximo Natal.",
    when: "Depois do Natal, na arrumação",
    letter: true,
  },
];
