// Sign-ups are sent by email through Web3Forms; nothing is stored by the Cloudly Game API.
// The access key only lets this form send to the inbox it was created for, so it is meant to be public.
const FORM_ENDPOINT = 'https://api.web3forms.com/submit'
const FORM_ACCESS_KEY = '371877e7-16ec-4de5-bb97-84d0d2cfa18f'
const SLOW_NOTICE_MS = 5000
const SUBMIT_TIMEOUT_MS = 120000

// Same order, names, colors and glyphs as the console shelf on the app home
const PLATFORMS = [
  ['neogeo', 'NEO GEO', 'Neo Geo', '#e53935', 'Arcade doméstico'],
  ['arcade', 'ARCADE', 'Arcade', '#ff6d00', 'Fliperama'],
  ['nes', 'NES', 'NES', '#c62828', 'Nintendo Entertainment System, console de mesa'],
  ['snes', 'SNES', 'Super Nintendo', '#5c6bc0', 'Console de mesa'],
  ['megadrive', 'MEGA DRIVE', 'Mega Drive', '#1e88e5', 'Console de mesa'],
  ['mastersystem', 'MASTER SYSTEM', 'Master System', '#26a69a', 'Console de mesa'],
  ['gb', 'GB', 'Game Boy', '#8bac0f', 'Portátil'],
  ['gbc', 'GBC', 'Game Boy Color', '#ffb300', 'Portátil'],
  ['gba', 'GBA', 'Game Boy Advance', '#7c4dff', 'Portátil'],
  ['nds', 'DS', 'Nintendo DS', '#90a4ae', 'Portátil de duas telas'],
  ['n64', 'N64', 'Nintendo 64', '#2e7d32', 'Console de mesa'],
]

const dpad = (x, y, size = 30) => {
  const arm = size / 3
  return `<path class="glyph-fill" d="M${x - arm / 2} ${y - size / 2}h${arm}v${arm}h${arm}v${arm}h-${arm}v${arm}h-${arm}v-${arm}h-${arm}v-${arm}h${arm}z" />`
}
const dots = (points, radius = 10) => points.map(([cx, cy]) => `<circle class="glyph-fill" cx="${cx}" cy="${cy}" r="${radius}" />`).join('')
const handheld = `<path class="glyph-body" d="M68 6H132A6 6 0 0 1 138 12V104A22 22 0 0 1 116 126H68A6 6 0 0 1 62 120V12A6 6 0 0 1 68 6Z" /><rect class="glyph-screen" x="74" y="18" width="52" height="42" rx="3" />${dpad(84, 88, 24)}${dots([[112, 92], [126, 82]], 7)}`
const GLYPHS = {
  nes: `<rect class="glyph-body" x="14" y="32" width="172" height="68" rx="10" />${dpad(52, 66)}${dots([[138, 70], [164, 70]], 12)}`,
  snes: `<rect class="glyph-body" x="10" y="24" width="180" height="84" rx="42" />${dpad(56, 66)}${dots([[146, 46], [146, 86], [126, 66], [166, 66]], 10)}`,
  megadrive: `<path class="glyph-body" d="M30 38Q100 18 170 38Q198 50 188 86Q180 114 150 102Q100 86 50 102Q20 114 12 86Q2 50 30 38Z" />${dpad(54, 62)}${dots([[124, 76], [146, 66], [168, 56]], 11)}`,
  mastersystem: `<rect class="glyph-body" x="16" y="34" width="168" height="64" rx="6" />${dpad(54, 66)}${dots([[132, 66], [160, 66]], 13)}`,
  neogeo: `<path class="glyph-body" d="M14 76H186L174 118H26Z" /><path class="glyph-line" d="M52 78V34" /><circle class="glyph-fill" cx="52" cy="26" r="18" />${dots([[96, 98], [120, 92], [144, 90], [168, 94]], 10)}`,
  arcade: `<path class="glyph-body" d="M14 76H186L174 118H26Z" /><path class="glyph-line" d="M48 78V34" /><circle class="glyph-fill" cx="48" cy="26" r="18" />${dots([[104, 90], [130, 88], [156, 90], [104, 108], [130, 106], [156, 108]], 8)}`,
  gb: handheld,
  gbc: handheld,
  gba: `<path class="glyph-body" d="M44 28H156Q192 28 192 64V70Q192 106 156 106H44Q8 106 8 70V64Q8 28 44 28Z" /><rect class="glyph-screen" x="64" y="40" width="72" height="52" rx="3" />${dpad(36, 66, 24)}${dots([[160, 72], [176, 60]], 8)}`,
  nds: '<rect class="glyph-body" x="52" y="4" width="96" height="58" rx="8" /><rect class="glyph-screen" x="66" y="14" width="68" height="40" rx="2" /><rect class="glyph-body" x="52" y="68" width="96" height="58" rx="8" /><rect class="glyph-screen" x="80" y="78" width="40" height="38" rx="2" />',
}
GLYPHS.n64 = GLYPHS.snes

const SOURCE_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const SOURCE_KEY = 'cloudly-landing-source'
const EMAIL_PATTERN = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/

document.documentElement.classList.remove('no-js')

// The loading screen leaves once the page styles apply and the fonts and images are in. On a slow
// connection it gives up waiting for fonts and images a few seconds after the page opened, but it
// always waits for the styles, so the page never shows unstyled. On the first visit of the session
// it also stays a short while, so Cloudly gets a moment on screen.
const LOADER_MAX_MS = 5000
const LOADER_MIN_MS = 2000
const LOADER_SEEN_KEY = 'cloudly-loader-seen'
const pageLoader = document.getElementById('page-loader')
let loaderSeen = false
try {
  loaderSeen = sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
  sessionStorage.setItem(LOADER_SEEN_KEY, '1')
} catch {
  // Storage can be blocked; the loading screen then just stays its short while every time
}
const loaderMinimum = new Promise((resolve) => setTimeout(resolve, loaderSeen ? 0 : Math.max(0, LOADER_MIN_MS - performance.now())))
const mainCss = document.getElementById('main-css')
const stylesReady = new Promise((resolve) => (mainCss.sheet ? resolve() : mainCss.addEventListener('load', resolve, { once: true })))
const pageLoaded = new Promise((resolve) => (document.readyState === 'complete' ? resolve() : addEventListener('load', resolve, { once: true })))
const loaderDeadline = new Promise((resolve) => setTimeout(resolve, Math.max(0, LOADER_MAX_MS - performance.now())))
const loaderDone = Promise.all([stylesReady, loaderMinimum, Promise.race([Promise.all([document.fonts.ready, pageLoaded]), loaderDeadline])])
loaderDone.then(() => {
  pageLoader.classList.add('is-done')
  pageLoader.addEventListener('transitionend', () => pageLoader.remove(), { once: true })
})
document.getElementById('year').textContent = new Date().getFullYear()

const chips = document.getElementById('console-chips')
const bubbles = document.getElementById('app-bubbles')
for (const [id, label, name, color, kind] of PLATFORMS) {
  const bubble = document.createElement('span')
  bubble.className = 'app-bubble'
  bubble.style.setProperty('--console-color', color)
  bubble.style.setProperty('--i', bubbles.children.length)
  bubble.innerHTML = `<span class="app-bubble-shell"></span><span class="app-bubble-burst"></span><span class="app-bubble-console"><span class="console-orb-circle"><svg class="console-glyph" viewBox="0 0 200 130">${GLYPHS[id]}</svg></span><span class="app-bubble-name">${name}</span></span>`
  bubbles.append(bubble)

  const chip = document.createElement('label')
  chip.className = 'chip'
  chip.style.setProperty('--chip-color', color)
  chip.innerHTML = `<input type="checkbox" name="consoles" value="${id}" /><span>${label}</span>`
  chips.append(chip)
}

// The app sketch in the hero plays on a loop. It opens with the headline writing itself on the screen,
// then the consoles pop on it as bubbles, then the highlights come in one by one, then the screen passes through a phone, a tablet, a computer
// and a TV with one word of "Jogue de qualquer lugar" on each; then it plays a first visit with the same steps and copy as the app:
// the nick is typed and confirmed, a photo is picked, a game opens on the loading screen, and it
// ends on the catalog rolling by.
// With reduced motion it stays on the headline.
const appDemo = document.getElementById('app-demo')
const appDemoNick = document.getElementById('app-demo-nick')
const appDemoNote = document.getElementById('app-demo-note')
const appDemoProgress = document.getElementById('app-demo-progress')
const appDemoStage = document.getElementById('app-demo-stage')
const appDevice = document.getElementById('app-device')
const appDeviceLabel = document.getElementById('app-device-label')
const appTaglineWords = document.querySelectorAll('#app-tagline .app-tag-word')
const DEMO_DEVICES = [
  ['phone', 'Celular'],
  ['tablet', 'Tablet'],
  ['laptop', 'Computador'],
  ['tv', 'TV'],
]
const nickStep = appDemo.querySelector('.app-step-nick')
const avatarStep = appDemo.querySelector('.app-step-avatar')
const DEMO_NICK = 'id0ubl3g'
// Covers from the app catalog, 24 games across every console, split into three rows
const CATALOG_COVERS = 24
const CATALOG_ROWS = 3
const appCatalog = document.getElementById('app-catalog')
for (let row = 0; row < CATALOG_ROWS; row++) {
  const line = document.createElement('span')
  line.className = 'app-catalog-row'
  const perRow = CATALOG_COVERS / CATALOG_ROWS
  // Each row holds its covers twice, so sliding it by half loops without a seam
  for (let copy = 0; copy < 2; copy++) {
    for (let index = 0; index < perRow; index++) {
      const cover = document.createElement('img')
      cover.src = `assets/games/covers/${String(row * perRow + index + 1).padStart(2, '0')}.webp`
      cover.alt = ''
      cover.loading = 'lazy'
      line.append(cover)
    }
  }
  appCatalog.append(line)
}
const NICK_HINT = appDemoNote.textContent
// Same labels and progress marks as the app while a session starts
const DEMO_STAGES = [
  [20, 'Reservando servidor'],
  [40, 'Preparando servidor'],
  [70, 'Iniciando emulador'],
  [95, 'Carregando jogo'],
  [100, 'Pronto'],
]
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function nickNote(text, ok = false) {
  appDemoNote.textContent = text
  appDemoNote.classList.toggle('is-ok', ok)
}

async function press(element) {
  element.classList.add('is-pressed')
  await wait(180)
  element.classList.remove('is-pressed')
}

async function playFirstVisit() {
  for (;;) {
    appDemoNick.textContent = ''
    nickNote(NICK_HINT)
    nickStep.classList.remove('is-typing', 'is-valid')
    avatarStep.classList.remove('is-picked')
    appDemoProgress.style.width = '0%'
    appDemoStage.textContent = DEMO_STAGES[0][1]
    appTaglineWords.forEach((word) => word.classList.remove('is-on'))
    appDevice.dataset.device = 'tv'
    appDemo.dataset.step = 'intro'
    await wait(5500)
    appDemo.dataset.step = 'consoles'
    await wait(4600)
    appDemo.dataset.step = 'features'
    await wait(4200)
    appDemo.dataset.step = 'devices'
    appDevice.classList.add('is-showing-devices')
    for (const [index, [device, label]] of DEMO_DEVICES.entries()) {
      appDevice.dataset.device = device
      appDeviceLabel.textContent = label
      appTaglineWords.forEach((word) => word.classList.remove('is-on'))
      await wait(250)
      appTaglineWords[index].classList.add('is-on')
      await wait(850)
    }
    await wait(400)
    appDevice.classList.remove('is-showing-devices')
    appDemo.dataset.step = 'nick'
    await wait(900)
    nickStep.classList.add('is-typing')
    for (const letter of DEMO_NICK) {
      appDemoNick.textContent += letter
      if (appDemoNick.textContent.length >= 3) nickNote('Verificando…')
      await wait(130)
    }
    await wait(500)
    nickNote('Disponível!', true)
    nickStep.classList.add('is-valid')
    await wait(900)
    await press(nickStep.querySelector('.app-step-button'))
    appDemo.dataset.step = 'avatar'
    await wait(1400)
    await press(avatarStep.querySelector('.app-option.is-robo'))
    avatarStep.classList.add('is-picked')
    await wait(800)
    appDemo.dataset.step = 'loading'
    for (const [progress, label] of DEMO_STAGES) {
      await wait(900)
      appDemoProgress.style.width = `${progress}%`
      appDemoStage.textContent = label
    }
    await wait(1200)
    appDemo.dataset.step = 'catalog'
    await wait(6500)
  }
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Starts once the loading screen is gone, so the headline is the first thing seen
  loaderDone.then(playFirstVisit)
}

// The first visit is the one that brought the person, so later visits in the same tab keep it
function trafficSource() {
  try {
    const saved = sessionStorage.getItem(SOURCE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Storage can be blocked; the current URL still has the campaign
  }
  const params = new URLSearchParams(location.search)
  const source = {}
  for (const field of SOURCE_FIELDS) {
    const value = params.get(field)
    if (value) source[field] = value.slice(0, 300)
  }
  if (document.referrer && !document.referrer.startsWith(location.origin)) source.referrer = document.referrer.slice(0, 300)
  try {
    sessionStorage.setItem(SOURCE_KEY, JSON.stringify(source))
  } catch {
    // Same as above
  }
  return source
}
const source = trafficSource()

const form = document.getElementById('lead-form')
const nameInput = document.getElementById('name')
const emailInput = document.getElementById('email')
const phoneInput = document.getElementById('phone')
const consentInput = document.getElementById('consent')
const submitButton = document.getElementById('submit')
const status = document.getElementById('form-status')

function phoneDigits(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  return digits.slice(0, 11)
}

function formatPhone(digits) {
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneDigits(phoneInput.value))
})

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`)
  error.textContent = message
  input.setAttribute('aria-invalid', message ? 'true' : 'false')
}

function validate() {
  const name = nameInput.value.trim().replace(/\s+/g, ' ')
  const email = emailInput.value.trim().toLowerCase()
  const phone = phoneDigits(phoneInput.value)
  const errors = [
    [nameInput, name.length < 2 ? 'Conta pra gente como te chamar.' : ''],
    [emailInput, !EMAIL_PATTERN.test(email) ? 'Digite um e-mail válido.' : ''],
    [phoneInput, phone && !/^[1-9]{2}9[0-9]{8}$/.test(phone) ? 'Use um celular com DDD, como (11) 91234-5678.' : ''],
    [consentInput, consentInput.checked ? '' : 'Precisamos do seu aceite para te avisar.'],
  ]
  for (const [input, message] of errors) setError(input, message)
  const firstInvalid = errors.find(([, message]) => message)
  if (firstInvalid) {
    firstInvalid[0].focus()
    return null
  }
  return { name, email, phone: phone ? `+55${phone}` : '' }
}

for (const input of [nameInput, emailInput, phoneInput, consentInput]) {
  input.addEventListener('change', () => {
    if (input.getAttribute('aria-invalid') === 'true') validate()
  })
}

function showSuccess(name) {
  form.hidden = true
  const success = document.getElementById('success')
  document.getElementById('success-name').textContent = name.split(' ')[0]
  success.hidden = false
  success.classList.add('is-visible')
  scrollToSection(success)
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  status.textContent = ''
  status.classList.remove('is-error')
  const lead = validate()
  if (!lead) return

  // Bots fill the hidden field; they get the same thank you and nothing is sent
  if (document.getElementById('website').value) {
    showSuccess(lead.name)
    return
  }

  const consoles = [...form.querySelectorAll('input[name="consoles"]:checked')].map((input) => input.nextElementSibling.textContent)
  const payload = {
    access_key: FORM_ACCESS_KEY,
    subject: `Novo inscrito no acesso antecipado: ${lead.name}`,
    from_name: 'Cloudly Game',
    replyto: lead.email,
    botcheck: '',
    Nome: lead.name,
    'E-mail': lead.email,
    Celular: lead.phone || 'não informado',
    Consoles: consoles.join(', ') || 'nenhum escolhido',
    Origem: Object.entries(source).map(([key, value]) => `${key}=${value}`).join(' · ') || 'acesso direto',
    Consentimento: `aceito em ${new Date().toISOString()}`,
  }

  submitButton.disabled = true
  submitButton.classList.add('is-loading')
  // If the email service is slow, the page says so and waits up to two minutes
  const slowNotice = setTimeout(() => {
    status.textContent = 'Enviando… o serviço de e-mail está demorando um pouco, não feche a página.'
  }, SLOW_NOTICE_MS)
  const timeout = new AbortController()
  const abort = setTimeout(() => timeout.abort(), SUBMIT_TIMEOUT_MS)
  try {
    // Sent as a plain form so the browser skips the CORS preflight, which Web3Forms' firewall rejects
    const body = new FormData()
    for (const [key, value] of Object.entries(payload)) body.append(key, value)
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
      signal: timeout.signal,
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.success !== true) throw new Error(result.message || `HTTP ${response.status}`)
    status.textContent = ''
    showSuccess(lead.name)
  } catch (error) {
    console.error('Sign-up failed', error)
    status.textContent = navigator.onLine
      ? 'Não conseguimos enviar agora. O serviço de e-mail está instável; tente de novo em instantes.'
      : 'Parece que você está sem internet. Confira sua conexão e tente de novo.'
    status.classList.add('is-error')
  } finally {
    clearTimeout(slowNotice)
    clearTimeout(abort)
    submitButton.disabled = false
    submitButton.classList.remove('is-loading')
  }
})

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

// In-page links put the section's content in the middle of the screen. A section taller
// than the screen starts near the top instead, so nothing is cut off.
function scrollToSection(target) {
  const first = target.firstElementChild ?? target
  const last = target.lastElementChild ?? target
  const top = first.getBoundingClientRect().top
  const height = last.getBoundingClientRect().bottom - top
  const offset = height < innerHeight ? (innerHeight - height) / 2 : 24
  scrollTo({ top: scrollY + top - offset, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]')
  if (!link || link.hasAttribute('data-open-help') || link.hasAttribute('data-open-privacy')) return
  const target = document.querySelector(link.getAttribute('href'))
  if (!target) return
  event.preventDefault()
  history.pushState(null, '', link.getAttribute('href'))
  scrollToSection(target)
})

// Help chat: Cloudly, the mascot, answers the frequent questions, picked from suggestions or typed.
// Typed questions are matched by keywords in the browser; there is no server behind it.
const HELP_QUESTIONS = [
  ['O que é o Cloudly Game?', 'Uma plataforma para jogar clássicos dos videogames direto no navegador. Os jogos rodam nos nossos servidores e chegam até você em vídeo, com resposta rápida aos seus comandos.', ['o que e', 'cloud game', 'cloudly game', 'cloudly', 'plataforma', 'como funciona', 'servidor', 'streaming']],
  ['Quando a plataforma abre?', 'Estamos preparando o lançamento. Quem se inscreve no acesso antecipado recebe o aviso primeiro, assim que entrarmos no ar.', ['quando', 'lanca', 'lancamento', 'abre', 'data', 'no ar', 'disponivel', 'estreia']],
  ['Como funciona o acesso antecipado?', 'Você deixa seu nome e e-mail no formulário desta página. Quando o Cloudly Game entrar no ar, avisamos você por e-mail antes de todo mundo.', ['acesso antecipado', 'antecipado', 'inscrever', 'inscricao', 'cadastro', 'lista', 'formulario', 'aviso', 'email']],
  ['Preciso instalar alguma coisa?', 'Não. Basta abrir no navegador, no computador ou no celular.', ['instalar', 'baixar', 'download', 'app', 'aplicativo', 'programa', 'emulador']],
  ['Funciona no celular?', 'Sim. No celular você joga pelo navegador com controles na tela, pelo toque.', ['celular', 'smartphone', 'android', 'iphone', 'tablet', 'mobile', 'toque']],
  ['Funciona com controle?', 'Funciona com teclado, com controles conectados ao computador e com controles na tela pelo toque.', ['controle', 'joystick', 'gamepad', 'teclado', 'manete', 'xbox', 'playstation']],
  ['Quais consoles vou poder jogar?', 'NES, Super Nintendo, Nintendo 64, Mega Drive, Master System, Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Neo Geo e Arcade.', ['console', 'consoles', 'plataformas', 'jogos', 'nintendo', 'sega', 'mega drive', 'snes', 'nes', 'n64', 'game boy', 'gba', 'neo geo', 'arcade', 'fliperama', 'catalogo']],
  ['Dá para jogar com amigos que estão longe?', 'Sim. Você cria uma sala e convida os amigos por código ou pela lista de amigos. Eles entram pela internet na mesma partida, com até quatro lugares.', ['amigo', 'amigos', 'online', 'multiplayer', 'sala', 'convidar', 'longe', 'internet', 'juntos']],
  ['E com alguém do meu lado?', 'Também. Até quatro pessoas podem jogar no mesmo computador: uma no teclado e as outras em controles. Plugou um controle, entrou na partida.', ['lado', 'mesmo computador', 'mesmo aparelho', 'local', 'sofa', 'dois jogadores', '2 jogadores']],
  ['Meu progresso fica salvo?', 'Fica. Seus saves vão junto com a sua conta na nuvem, com três slots de estado por jogo e um ponto para continuar de onde parou.', ['salvar', 'salvo', 'save', 'saves', 'progresso', 'continuar', 'nuvem', 'perder']],
  ['Posso transmitir minhas partidas?', 'Pode. Você transmite ao vivo para todo mundo, só para amigos ou para amigos escolhidos, e salva um clipe dos últimos 60 segundos quando sair aquela jogada.', ['transmitir', 'ao vivo', 'live', 'stream', 'clipe', 'gravar', 'gravacao', 'assistir']],
  ['Como funcionam XP e ranks?', 'Cada partida rende XP. Você sobe de rank do Cobre à Ametista, mantém uma sequência diária de jogo e desbloqueia conquistas.', ['xp', 'rank', 'ranks', 'nivel', 'conquista', 'conquistas', 'pontos', 'ranking']],
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

// Suggestions only follow the latest answer, so the conversation stays easy to read
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

// The full list opens over the conversation only when asked for
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
for (const link of document.querySelectorAll('a[data-open-help]')) {
  link.addEventListener('click', (event) => {
    event.preventDefault()
    openHelp()
  })
}
// The speech bubble shows once, a little after the TV has finished turning on
setTimeout(() => {
  if (helpPanel.hidden && !helpStarted) helpBubble.classList.add('is-visible')
}, 7000)

// Privacy note in a popup; a click on the dimmed area around it closes it too
const privacy = document.getElementById('privacidade')
for (const link of document.querySelectorAll('[data-open-privacy]')) {
  link.addEventListener('click', (event) => {
    event.preventDefault()
    privacy.showModal()
  })
}
for (const button of privacy.querySelectorAll('.modal-close, .modal-ok')) button.addEventListener('click', () => privacy.close())
privacy.addEventListener('click', (event) => {
  if (event.target === privacy) privacy.close()
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
