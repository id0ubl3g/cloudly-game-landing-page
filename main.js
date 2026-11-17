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
  ['psx', 'PS1', 'PlayStation 1', '#607d8b'],
  ['n64', 'N64', 'Nintendo 64', '#2e7d32'],
]

document.documentElement.classList.remove('no-js')

// The loader waits for the fonts and, for a short while, the images; whatever is still on its way shows a skeleton
const LOADER_MAX_MS = 2600
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
const loaderDone = Promise.all([stylesReady, loaderMinimum, Promise.race([Promise.all([document.fonts.ready, pageLoaded]), Promise.all([document.fonts.ready, loaderDeadline])])])
loaderDone.then(() => {
  document.documentElement.classList.add('is-loaded')
  pageLoader.classList.add('is-done')
  pageLoader.addEventListener('transitionend', () => pageLoader.remove(), { once: true })
})
document.getElementById('year').textContent = new Date().getFullYear()

const SHOWCASE = [
  ['neogeo', 320 / 205],
  ['arcade', 180 / 240],
  ['nes', 312 / 240],
  ['snes', 287 / 240],
  ['megadrive', 320 / 222],
  ['mastersystem', 320 / 198],
  ['gb', 194 / 240],
  ['gbc', 172 / 240],
  ['gba', 303 / 210],
  ['nds', 242 / 240],
  ['psx', 320 / 200],
  ['n64', 320 / 209],
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

const finePointer = matchMedia('(hover: hover) and (pointer: fine)')

// Images that arrive after the loader leaves hold their place with a skeleton, then fade in
function trackImage(img) {
  if (img.complete && img.naturalWidth) return
  const holder = img.closest('.console-item-art, .app-shelf-art') || img
  holder.classList.add('is-pending')
  const done = () => {
    holder.classList.remove('is-pending')
    img.classList.add('is-arriving')
  }
  img.addEventListener('load', done, { once: true })
  img.addEventListener('error', done, { once: true })
}

// Consoles on a roulette wheel: the hub sits off screen, the console in front faces the visitor and its neighbours
// turn in from the edges, cut by the screen. The wheel holds the 12 consoles, 30° apart, a whole turn
const CONSOLE_TURN_MS = 3200
const consoleShow = document.getElementById('console-show')
const consoleWheel = document.getElementById('console-wheel')
const consoleItems = SHOWCASE.map(([id, ratio], index) => {
  const [, , name, color] = platformById[id]
  const item = document.createElement('figure')
  item.className = 'console-item'
  item.style.setProperty('--i', index)
  item.innerHTML = `<span class="console-item-art">${consoleArt(id, ratio)}</span><figcaption>${name}</figcaption>`
  consoleWheel.append(item)
  return { item, name, color }
})
const consoleTotal = consoleItems.length
let consoleTurn = 0
const wrapIndex = (turn) => ((turn % consoleTotal) + consoleTotal) % consoleTotal

function paintWheel() {
  const active = wrapIndex(consoleTurn)
  consoleShow.style.setProperty('--turn', consoleTurn)
  consoleShow.style.setProperty('--console-color', consoleItems[active].color)
  consoleItems.forEach(({ item }, index) => {
    let distance = wrapIndex(index - consoleTurn)
    if (distance > consoleTotal / 2) distance -= consoleTotal
    item.classList.toggle('is-active', distance === 0)
    item.classList.toggle('is-near', Math.abs(distance) === 1)
    item.setAttribute('aria-hidden', String(distance !== 0))
  })
}

let consoleTimer = 0
let consolePaused = false
function scheduleTurn() {
  clearTimeout(consoleTimer)
  if (consolePaused || reducedMotion.matches || document.hidden) return
  consoleTimer = setTimeout(() => turnWheel(1), CONSOLE_TURN_MS)
}

function turnWheel(steps) {
  consoleTurn += steps
  paintWheel()
  scheduleTurn()
}

consoleShow.addEventListener('keydown', (event) => {
  const steps = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key]
  if (!steps) return
  event.preventDefault()
  turnWheel(steps)
})

const pauseWheel = (paused) => {
  consolePaused = paused
  scheduleTurn()
}
consoleShow.addEventListener('pointerenter', (event) => event.pointerType === 'mouse' && pauseWheel(true))
consoleShow.addEventListener('pointerleave', (event) => event.pointerType === 'mouse' && pauseWheel(false))
consoleShow.addEventListener('focusin', () => pauseWheel(true))
consoleShow.addEventListener('focusout', (event) => !consoleShow.contains(event.relatedTarget) && pauseWheel(false))
document.addEventListener('visibilitychange', scheduleTurn)

// A strong flick lets the wheel run free: it keeps turning, slows down and lands on a console nobody picked,
// one or more whole turns further the harder it was thrown
const FLING_SPEED = 4
let flingTimer = 0
let flinging = false
function fling(speed) {
  const direction = Math.sign(speed)
  const turns = Math.min(2, Math.floor(Math.abs(speed) / 12))
  const steps = direction * (consoleTotal * turns + 6 + Math.floor(Math.random() * consoleTotal))
  const duration = Math.min(4200, 1600 + Math.abs(steps) * 70)
  flinging = true
  clearTimeout(consoleTimer)
  consoleShow.style.setProperty('--fling-ms', `${duration}ms`)
  consoleShow.classList.add('is-flung')
  consoleTurn += steps
  paintWheel()
  clearTimeout(flingTimer)
  flingTimer = setTimeout(() => {
    flinging = false
    consoleShow.classList.remove('is-flung')
    scheduleTurn()
  }, duration)
}

// Dragging turns the wheel under the finger: up and down on wide screens, sideways on narrow ones
const horizontalWheel = matchMedia('(max-width: 960px)')
let drag = null
consoleShow.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || flinging) return
  const item = consoleItems[0].item.getBoundingClientRect()
  const factor = parseFloat(getComputedStyle(consoleWheel).getPropertyValue('--r-factor')) || 2.5
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, perItem: (item.width * factor) / 2, samples: [] }
})
consoleShow.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.id) return
  const delta = horizontalWheel.matches ? event.clientX - drag.x : event.clientY - drag.y
  if (!drag.moved && Math.abs(delta) < 8) return
  if (!drag.moved) {
    drag.moved = true
    consoleShow.setPointerCapture(event.pointerId)
    consoleShow.classList.add('is-dragging')
    clearTimeout(consoleTimer)
  }
  drag.offset = Math.max(-2.5, Math.min(2.5, -delta / drag.perItem))
  consoleShow.style.setProperty('--drag', drag.offset)
  // How fast the finger moves, in consoles per second, measured over its last tenth of a second
  const now = performance.now()
  drag.samples.push([now, -delta / drag.perItem])
  while (drag.samples.length > 2 && now - drag.samples[0][0] > 100) drag.samples.shift()
})
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return
  const { moved, offset = 0, samples } = drag
  drag = null
  consoleShow.classList.remove('is-dragging')
  consoleShow.style.setProperty('--drag', 0)
  if (!moved) return
  const [first, last] = [samples[0], samples[samples.length - 1]]
  const elapsed = last && performance.now() - last[0] < 80 ? last[0] - first[0] : 0
  const speed = elapsed > 0 ? ((last[1] - first[1]) / elapsed) * 1000 : 0
  if (Math.abs(speed) >= FLING_SPEED && !reducedMotion.matches) {
    fling(speed)
    return
  }
  turnWheel(Math.abs(offset) < 0.2 ? 0 : Math.round(offset) || Math.sign(offset))
}
consoleShow.addEventListener('pointerup', endDrag)
consoleShow.addEventListener('pointercancel', endDrag)

// The wheel opens with a full spin back to the first console, like a roulette landing
if (!reducedMotion.matches) consoleTurn = -consoleTotal
paintWheel()
loaderDone.then(() => {
  if (consoleTurn < 0) {
    setTimeout(() => {
      consoleShow.classList.add('is-spinning')
      consoleTurn = 0
      paintWheel()
      setTimeout(() => {
        consoleShow.classList.remove('is-spinning')
        scheduleTurn()
      }, 2200)
    }, 350)
    return
  }
  scheduleTurn()
})

// The headline comes in letter by letter, as the app's hero title. Screen readers keep the whole sentence through the label
function splitTitle(title) {
  let count = 0
  const label = title.textContent.replace(/\s+/g, ' ').trim()
  const fill = (from, into) => {
    for (const node of from.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const copy = node.cloneNode(false)
        fill(node, copy)
        into.append(copy)
        continue
      }
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue
        if (/^\s+$/.test(part)) {
          into.append(' ')
          continue
        }
        const word = document.createElement('span')
        word.className = 'split-word'
        for (const letter of part) {
          const mask = document.createElement('span')
          mask.className = 'split-mask'
          const char = document.createElement('span')
          char.className = 'split-char'
          char.style.setProperty('--c', count++)
          char.textContent = letter
          mask.append(char)
          word.append(mask)
        }
        into.append(word)
      }
    }
  }
  const letters = document.createElement('span')
  letters.setAttribute('aria-hidden', 'true')
  fill(title, letters)
  title.replaceChildren(letters)
  title.setAttribute('aria-label', label)
  title.classList.remove('intro')
  title.classList.add('is-split')

  // The gradient runs across each line of the accent words as one, so each letter shows its own slice of it
  const accent = title.querySelector('.is-accent')
  const paintAccent = () => {
    if (!accent) return
    const lines = new Map()
    for (const char of accent.querySelectorAll('.split-char')) {
      const box = char.getBoundingClientRect()
      const key = Math.round(box.top / 4)
      if (!lines.has(key)) lines.set(key, [])
      lines.get(key).push([char, box])
    }
    for (const line of lines.values()) {
      const left = line[0][1].left
      const width = line[line.length - 1][1].right - left
      for (const [char, box] of line) {
        char.style.setProperty('--accent-w', `${width}px`)
        char.style.setProperty('--accent-x', `${box.left - left}px`)
      }
    }
  }
  paintAccent()
  document.fonts.ready.then(paintAccent)
  addEventListener('resize', paintAccent, { passive: true })
}
document.querySelectorAll('[data-split]').forEach(splitTitle)

for (const img of document.querySelectorAll('img[src$=".webp"]')) trackImage(img)

// The bar turns to glass once the page scrolls, and its play button only shows when the big one in the hero is gone
const nav = document.querySelector('.nav')
const syncNav = () => nav.classList.toggle('is-scrolled', scrollY > 8)
syncNav()
addEventListener('scroll', syncNav, { passive: true })
const navCta = document.getElementById('nav-cta')
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => navCta.classList.toggle('is-tucked', entry.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(document.getElementById('hero-cta'))
}

const HELP_QUESTIONS = [
  ['O que é o Cloudly Game?', 'Uma plataforma para jogar clássicos dos videogames direto no navegador. Os jogos rodam nos nossos servidores e chegam até você em vídeo, com resposta rápida aos seus comandos.', ['o que e', 'cloud game', 'cloudly game', 'cloudly', 'plataforma', 'como funciona', 'servidor', 'streaming']],
  ['Quando a plataforma abre?', 'Em breve. Estamos nos últimos ajustes, e o botão Jogar agora desta página vai levar direto para a plataforma assim que ela entrar no ar.', ['quando', 'lanca', 'lancamento', 'abre', 'data', 'no ar', 'disponivel', 'estreia', 'em breve', 'jogar agora']],
  ['Funciona na TV?', 'Funciona. Abra pelo navegador da TV ou de um computador ligado nela e jogue com controle, como num videogame.', ['tv', 'televisao', 'smart tv', 'telao']],
  ['Preciso instalar alguma coisa?', 'Não. Basta abrir no navegador, no computador, no celular ou na TV.', ['instalar', 'baixar', 'download', 'app', 'aplicativo', 'programa', 'emulador']],
  ['Funciona no celular?', 'Sim. No celular você joga pelo navegador com controles na tela, pelo toque.', ['celular', 'smartphone', 'android', 'iphone', 'tablet', 'mobile', 'toque']],
  ['Funciona com controle?', 'Funciona com teclado, com controles conectados ao computador e com controles na tela pelo toque.', ['controle', 'joystick', 'gamepad', 'teclado', 'manete', 'xbox', 'playstation']],
  ['Quais consoles vou poder jogar?', 'NES, Super Nintendo, Nintendo 64, PlayStation 1, Mega Drive, Master System, Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Neo Geo e Arcade.', ['console', 'consoles', 'plataformas', 'jogos', 'nintendo', 'sega', 'mega drive', 'snes', 'nes', 'n64', 'game boy', 'gba', 'neo geo', 'arcade', 'fliperama', 'catalogo', 'playstation', 'ps1', 'psx', 'sony']],
  ['Dá para jogar com amigos que estão longe?', 'Sim. Você cria uma sala e convida os amigos por código ou pela lista de amigos. Eles entram pela internet na mesma partida, com até quatro lugares.', ['amigo', 'amigos', 'online', 'multiplayer', 'sala', 'convidar', 'longe', 'internet', 'juntos']],
  ['E com alguém do meu lado?', 'Também. Até quatro pessoas podem jogar no mesmo computador: uma no teclado e as outras em controles. Plugou um controle, entrou na partida.', ['lado', 'mesmo computador', 'mesmo aparelho', 'local', 'sofa', 'dois jogadores', '2 jogadores']],
  ['Meu progresso fica salvo?', 'Fica. Seus saves vão junto com a sua conta na nuvem, com três slots de estado por jogo e um ponto para continuar de onde parou.', ['salvar', 'salvo', 'save', 'saves', 'progresso', 'continuar', 'nuvem', 'perder']],
  ['Posso transmitir minhas partidas?', 'Pode. Você transmite ao vivo para os seus amigos, ou só para os que escolher, e eles assistem pela lista de amigos. Também dá para salvar um clipe dos últimos 60 segundos quando sair aquela jogada e baixar em MP4.', ['transmitir', 'ao vivo', 'live', 'stream', 'clipe', 'gravar', 'gravacao', 'assistir']],
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

// On a phone the chat takes the whole screen and follows the keyboard, so the composer never hides under it
const fullScreenHelp = matchMedia('(max-width: 640px)')
function fitHelpToViewport() {
  const viewport = window.visualViewport
  if (!viewport) return
  helpPanel.style.setProperty('--viewport-h', `${viewport.height}px`)
  helpPanel.style.setProperty('--viewport-top', `${viewport.offsetTop}px`)
}
window.visualViewport?.addEventListener('resize', fitHelpToViewport)
window.visualViewport?.addEventListener('scroll', fitHelpToViewport)

function openHelp() {
  helpPanel.hidden = false
  helpLauncher.setAttribute('aria-expanded', 'true')
  helpBubble.classList.remove('is-visible')
  document.documentElement.classList.add('is-help-open')
  fitHelpToViewport()
  if (!helpStarted) {
    helpStarted = true
    helpMessage(HELP_GREETING, 'bot')
    showSuggestions(nextSuggestions(4))
  }
  // Touch screens keep the keyboard closed, so the suggestions stay in sight; a tap on the field opens it
  if (finePointer.matches && !fullScreenHelp.matches) helpInput.focus()
  else helpPanel.querySelector('.help-close').focus({ preventScroll: true })
}

function closeHelp() {
  helpPanel.hidden = true
  closeFaq()
  helpLauncher.setAttribute('aria-expanded', 'false')
  document.documentElement.classList.remove('is-help-open')
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
