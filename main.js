const PLATFORMS = [
  ['neogeo', 'NEO GEO', 'Neo Geo', '#e53935'],
  ['arcade', 'ARCADE', 'Arcade', '#ff6d00'],
  ['nes', 'NES', 'NES', '#c62828'],
  ['snes', 'SNES', 'Super Nintendo', '#5c6bc0'],
  ['megadrive', 'MEGA DRIVE', 'Mega Drive', '#1e88e5'],
  ['mastersystem', 'MASTER SYSTEM', 'Master System', '#26a69a'],
  ['gb', 'GB', 'Game Boy', '#8bac0f'],
  ['gbc', 'GBC', 'Game Boy Color', '#ffb300'],
  ['gba', 'GBA', 'Game Boy Advance', '#7c4dff'],
  ['nds', 'DS', 'Nintendo DS', '#90a4ae'],
  ['n64', 'N64', 'Nintendo 64', '#2e7d32'],
]

document.documentElement.classList.remove('no-js')

const LOADER_MAX_MS = 5000
const LOADER_MIN_MS = 2000
const LOADER_SEEN_KEY = 'cloudly-loader-seen'
const pageLoader = document.getElementById('page-loader')
let loaderSeen = false
try {
  loaderSeen = sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
  sessionStorage.setItem(LOADER_SEEN_KEY, '1')
} catch {
}
const loaderMinimum = new Promise((resolve) => setTimeout(resolve, loaderSeen ? 0 : Math.max(0, LOADER_MIN_MS - performance.now())))
const mainCss = document.getElementById('main-css')
const stylesReady = new Promise((resolve) => (mainCss.sheet ? resolve() : mainCss.addEventListener('load', resolve, { once: true })))
const pageLoaded = new Promise((resolve) => (document.readyState === 'complete' ? resolve() : addEventListener('load', resolve, { once: true })))
const loaderDeadline = new Promise((resolve) => setTimeout(resolve, Math.max(0, LOADER_MAX_MS - performance.now())))
const loaderDone = Promise.all([stylesReady, loaderMinimum, Promise.race([Promise.all([document.fonts.ready, pageLoaded]), loaderDeadline])])
loaderDone.then(() => {
  document.documentElement.classList.add('is-loaded')
  pageLoader.classList.add('is-done')
  pageLoader.addEventListener('transitionend', () => pageLoader.remove(), { once: true })
})
document.getElementById('year').textContent = new Date().getFullYear()

const SHOWCASE = [
  ['neogeo', 320 / 205],
  ['arcade', 180 / 240],
  ['gba', 303 / 210],
  ['nds', 242 / 240],
  ['nes', 312 / 240],
  ['gb', 194 / 240],
  ['megadrive', 320 / 222],
  ['snes', 287 / 240],
  ['gbc', 172 / 240],
  ['n64', 320 / 209],
  ['mastersystem', 320 / 198],
]
const SHOWCASE_AREA = 0.72
const platformById = Object.fromEntries(PLATFORMS.map((platform) => [platform[0], platform]))
const consoleArt = (id, ratio) => `<img src="assets/consoles/${id}.webp" alt="" style="height: ${Math.min(100, (SHOWCASE_AREA / Math.sqrt(ratio)) * 100).toFixed(1)}%" draggable="false" />`

const shelf = document.getElementById('app-shelf')
for (const [id, ratio] of SHOWCASE) {
  const item = document.createElement('span')
  item.className = 'app-shelf-item'
  item.innerHTML = `<span class="app-shelf-art">${consoleArt(id, ratio)}</span><span>${platformById[id][1]}</span>`
  shelf.append(item)
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

const CONSOLE_SLIDE_MS = 2800
const consoleShow = document.getElementById('console-show')
const consoleDots = document.getElementById('console-show-dots')
const consoleSlides = SHOWCASE.map(([id, ratio]) => {
  const [, , name, color] = platformById[id]
  const slide = document.createElement('figure')
  slide.className = 'console-slide'
  slide.style.setProperty('--console-color', color)
  slide.innerHTML = `<span class="console-slide-art"><span class="console-slide-glow"></span>${consoleArt(id, ratio)}</span><figcaption><strong>${name}</strong></figcaption>`
  consoleShow.append(slide)
  const dot = document.createElement('i')
  consoleDots.append(dot)
  return [slide, dot]
})
let consoleIndex = 0
function showConsole(next) {
  const [slide, dot] = consoleSlides[consoleIndex]
  slide.classList.remove('is-active')
  dot.classList.remove('is-active')
  consoleIndex = (next + consoleSlides.length) % consoleSlides.length
  consoleSlides[consoleIndex][0].classList.add('is-active')
  consoleSlides[consoleIndex][1].classList.add('is-active')
}
showConsole(0)
setInterval(() => showConsole(consoleIndex + 1), CONSOLE_SLIDE_MS)

const HELP_QUESTIONS = [
  ['O que é o Cloudly Game?', 'Uma plataforma para jogar clássicos dos videogames direto no navegador. Os jogos rodam nos nossos servidores e chegam até você em vídeo, com resposta rápida aos seus comandos.', ['o que e', 'cloud game', 'cloudly game', 'cloudly', 'plataforma', 'como funciona', 'servidor', 'streaming']],
  ['Quando a plataforma abre?', 'Em breve. Estamos nos últimos ajustes, e o botão Jogar agora desta página vai levar direto para a plataforma assim que ela entrar no ar.', ['quando', 'lanca', 'lancamento', 'abre', 'data', 'no ar', 'disponivel', 'estreia', 'em breve', 'jogar agora']],
  ['Funciona na TV?', 'Funciona. Abra pelo navegador da TV ou de um computador ligado nela e jogue com controle, como num videogame.', ['tv', 'televisao', 'smart tv', 'telao']],
  ['Preciso instalar alguma coisa?', 'Não. Basta abrir no navegador, no computador, no celular ou na TV.', ['instalar', 'baixar', 'download', 'app', 'aplicativo', 'programa', 'emulador']],
  ['Funciona no celular?', 'Sim. No celular você joga pelo navegador com controles na tela, pelo toque.', ['celular', 'smartphone', 'android', 'iphone', 'tablet', 'mobile', 'toque']],
  ['Funciona com controle?', 'Funciona com teclado, com controles conectados ao computador e com controles na tela pelo toque.', ['controle', 'joystick', 'gamepad', 'teclado', 'manete', 'xbox', 'playstation']],
  ['Quais consoles vou poder jogar?', 'NES, Super Nintendo, Nintendo 64, Mega Drive, Master System, Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Neo Geo e Arcade.', ['console', 'consoles', 'plataformas', 'jogos', 'nintendo', 'sega', 'mega drive', 'snes', 'nes', 'n64', 'game boy', 'gba', 'neo geo', 'arcade', 'fliperama', 'catalogo']],
  ['Dá para jogar com amigos que estão longe?', 'Sim. Você cria uma sala e convida os amigos por código ou pela lista de amigos. Eles entram pela internet na mesma partida, com até quatro lugares.', ['amigo', 'amigos', 'online', 'multiplayer', 'sala', 'convidar', 'longe', 'internet', 'juntos']],
  ['E com alguém do meu lado?', 'Também. Até quatro pessoas podem jogar no mesmo computador: uma no teclado e as outras em controles. Plugou um controle, entrou na partida.', ['lado', 'mesmo computador', 'mesmo aparelho', 'local', 'sofa', 'dois jogadores', '2 jogadores']],
  ['Meu progresso fica salvo?', 'Fica. Seus saves vão junto com a sua conta na nuvem, com três slots de estado por jogo e um ponto para continuar de onde parou.', ['salvar', 'salvo', 'save', 'saves', 'progresso', 'continuar', 'nuvem', 'perder']],
  ['Posso transmitir minhas partidas?', 'Pode. Você transmite ao vivo para todo mundo, só para amigos ou para amigos escolhidos, e salva um clipe dos últimos 60 segundos quando sair aquela jogada.', ['transmitir', 'ao vivo', 'live', 'stream', 'clipe', 'gravar', 'gravacao', 'assistir']],
  ['Como funcionam XP e nível?', 'Toda partida rende XP, casual ou ranked. Com XP você sobe de nível, mantém uma sequência diária de jogo e desbloqueia conquistas. O elo é separado: ele vem só do ranked.', ['xp', 'nivel', 'level', 'conquista', 'conquistas', 'combo', 'sequencia']],
  ['Tem campeonatos?', 'Tem. Os campeonatos ficam na aba Eventos, com data marcada no calendário e inscrição em 1v1 ou em dupla. A chave é eliminatória, cada vitória vale um ponto e a partida passa ao vivo na página do evento. Quando chega a sua vez, o Cloudly avisa e você tem 5 minutos para entrar na sala.', ['campeonato', 'campeonatos', 'evento', 'eventos', 'torneio', 'torneios', 'copa', 'chave', 'chaves', 'inscricao', 'inscrever', 'mata mata', 'eliminatoria']],
  ['Como funciona o ranked?', 'Nos jogos de luta com ranked, você busca um adversário e joga uma série FT2: vence quem ganhar duas lutas primeiro. O placar sai da memória do jogo, cada série dá ou tira pontos de elo, do Cobre à Ametista, e os 50 melhores aparecem no ranking. Abandonar conta como derrota.', ['ranked', 'rank', 'ranks', 'elo', 'elos', 'ranking', 'ft2', 'serie', 'competitivo', 'pontos', 'luta']],
]
const HELP_GREETING = 'Oi! Eu sou o Cloudly. Pode escrever sua dúvida ou tocar numa das sugestões.'
const HELP_UNKNOWN = 'Ainda não sei responder isso. Veja se uma destas ajuda:'
const HELP_TYPING_MS = 650
const helpLauncher = document.getElementById('help-launcher')
const helpPanel = document.getElementById('help-panel')
const helpLog = document.getElementById('help-log')
const helpInput = document.getElementById('help-input')
const helpFaq = document.getElementById('help-faq')
const helpFaqToggle = document.getElementById('help-faq-toggle')
const helpBubble = document.getElementById('help-bubble')
const answered = new Set()
let helpStarted = false
let helpBusy = false

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const clock = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

function scrollLog() {
  helpLog.scrollTop = helpLog.scrollHeight
}

function helpMessage(text, from) {
  const row = document.createElement('div')
  row.className = `help-row help-row-${from}`
  if (from === 'bot') row.innerHTML = '<span class="help-avatar" aria-hidden="true"><img src="assets/mascot-sm.png" alt="" width="24" height="19" /></span>'
  const bubble = document.createElement('div')
  bubble.className = 'help-message'
  const body = document.createElement('p')
  body.textContent = text
  const time = document.createElement('time')
  time.textContent = clock()
  bubble.append(body, time)
  row.append(bubble)
  helpLog.append(row)
  scrollLog()
  return { row, bubble, body }
}

function showSuggestions(indexes) {
  helpLog.querySelector('.help-suggestions')?.remove()
  if (!indexes.length) return
  const box = document.createElement('div')
  box.className = 'help-suggestions'
  for (const index of indexes) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = HELP_QUESTIONS[index][0]
    button.addEventListener('click', () => askHelp(index))
    box.append(button)
  }
  helpLog.append(box)
  scrollLog()
}

function nextSuggestions(count = 3) {
  return HELP_QUESTIONS.map((_, index) => index).filter((index) => !answered.has(index)).slice(0, count)
}

function botReply(text, after) {
  helpBusy = true
  const typing = document.createElement('div')
  typing.className = 'help-row help-row-bot'
  typing.innerHTML = '<span class="help-avatar" aria-hidden="true"><img src="assets/mascot-sm.png" alt="" width="24" height="19" /></span><div class="help-message is-typing" aria-label="Digitando"><span></span><span></span><span></span></div>'
  helpLog.append(typing)
  scrollLog()
  setTimeout(() => {
    typing.remove()
    helpMessage(text, 'bot')
    after?.()
    helpBusy = false
  }, reducedMotion.matches ? 0 : HELP_TYPING_MS)
}

function askHelp(index, typed) {
  if (helpBusy) return
  closeFaq()
  helpLog.querySelector('.help-suggestions')?.remove()
  helpMessage(typed || HELP_QUESTIONS[index][0], 'user')
  answered.add(index)
  botReply(HELP_QUESTIONS[index][1], () => {
    if (index === 2) {
      const cta = document.createElement('a')
      cta.className = 'button button-primary button-small help-cta'
      cta.href = '#lista'
      cta.textContent = 'Ir para o formulário'
      cta.addEventListener('click', () => closeHelp())
      helpLog.append(cta)
    }
    showSuggestions(nextSuggestions())
  })
}

function matchQuestion(text) {
  const words = ` ${normalize(text)} `
  let best = -1
  let bestScore = 0
  HELP_QUESTIONS.forEach(([question, , keywords], index) => {
    const score = keywords.reduce((total, keyword) => total + (words.includes(` ${keyword} `) || (keyword.includes(' ') && words.includes(keyword)) ? keyword.length : 0), 0)
    if (score > bestScore) {
      best = index
      bestScore = score
    }
  })
  return best
}

document.getElementById('help-composer').addEventListener('submit', (event) => {
  event.preventDefault()
  const text = helpInput.value.trim()
  if (!text || helpBusy) return
  helpInput.value = ''
  const index = matchQuestion(text)
  if (index >= 0) {
    askHelp(index, text)
    return
  }
  closeFaq()
  helpLog.querySelector('.help-suggestions')?.remove()
  helpMessage(text, 'user')
  botReply(HELP_UNKNOWN, () => showSuggestions(nextSuggestions(4)))
})

const faqList = document.getElementById('help-faq-list')
HELP_QUESTIONS.forEach(([question], index) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = question
  button.addEventListener('click', () => askHelp(index))
  faqList.append(button)
})

function closeFaq() {
  helpFaq.hidden = true
  helpFaqToggle.setAttribute('aria-expanded', 'false')
}

helpFaqToggle.addEventListener('click', () => {
  const open = helpFaq.hidden
  helpFaq.hidden = !open
  helpFaqToggle.setAttribute('aria-expanded', String(open))
  if (open) faqList.querySelector('button')?.focus()
})

function openHelp() {
  helpPanel.hidden = false
  helpLauncher.setAttribute('aria-expanded', 'true')
  helpBubble.classList.remove('is-visible')
  if (!helpStarted) {
    helpStarted = true
    helpMessage(HELP_GREETING, 'bot')
    showSuggestions(nextSuggestions(4))
  }
  helpInput.focus()
}

function closeHelp() {
  helpPanel.hidden = true
  closeFaq()
  helpLauncher.setAttribute('aria-expanded', 'false')
}

helpLauncher.addEventListener('click', () => (helpPanel.hidden ? openHelp() : closeHelp()))
helpPanel.querySelector('.help-close').addEventListener('click', () => {
  closeHelp()
  helpLauncher.focus()
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || helpPanel.hidden) return
  if (!helpFaq.hidden) {
    closeFaq()
    helpFaqToggle.focus()
    return
  }
  closeHelp()
  helpLauncher.focus()
})
const HELP_BUBBLE_DELAY_MS = 1500
const HELP_BUBBLE_MS = 5000
loaderDone.then(() => {
  setTimeout(() => {
    if (!helpPanel.hidden || helpStarted) return
    helpBubble.classList.add('is-visible')
    setTimeout(() => helpBubble.classList.remove('is-visible'), HELP_BUBBLE_MS)
  }, HELP_BUBBLE_DELAY_MS)
})

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12 })
  : null
for (const element of document.querySelectorAll('.reveal')) {
  if (observer) observer.observe(element)
  else element.classList.add('is-visible')
}
