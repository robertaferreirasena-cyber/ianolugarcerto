/*
 * Quiz de aplicação "IA no Lugar Certo" — versão ampliada.
 * Coleta o suficiente para montar a proposta comercial + protótipo (padrão Lumina/Maria Pia).
 * Cada etapa é declarada em STEPS; o formulário é montado a partir daqui.
 *
 * Envio:
 *  1. Jornada do Lead (JORNADA_ENDPOINT) — cria o lead já com o briefing completo.
 *     Fica vazio até a rota /api/captacao existir no app; aí é só preencher a URL.
 *  2. Google Forms (cópia de segurança dos campos principais).
 *  3. WhatsApp da Roberta com o resumo (a pessoa toca em enviar).
 */
(function () {
  'use strict';

  var JORNADA_ENDPOINT = ''; // ex.: 'https://jornada.robertasena.com.br/api/captacao'
  var WHATSAPP = '5551997980507';
  var QUIZ_ID = 'ianolugarcerto';

  /* ---------- Etapas ---------- */
  // type: text | textarea | single | multi | color | contact. showIf: (a) => boolean.
  var STEPS = [
    { stage: 'Você', title: 'Como podemos te chamar?', intro: 'Começamos pelo básico.',
      groups: [{ type: 'text', name: 'nome', label: 'Seu nome', placeholder: 'Seu nome', required: true, autocomplete: 'name' }] },

    { stage: 'Negócio', title: 'Qual negócio vamos analisar?', intro: 'Nome e cidade ajudam a dar contexto à operação.',
      groups: [
        { type: 'text', name: 'empresa', label: 'Empresa ou marca', placeholder: 'Nome do negócio', required: true, autocomplete: 'organization', half: true },
        { type: 'text', name: 'cidade', label: 'Cidade (opcional)', placeholder: 'Ex.: Porto Alegre/RS', half: true }
      ] },

    { stage: 'Negócio', title: 'Qual é o seu segmento?', intro: 'Escolha o que mais se parece com o seu negócio.',
      groups: [{ type: 'single', name: 'segmento', required: true, cols: 2, other: true, options: [
        'Clínica de estética ou saúde', 'Mentoria, cursos ou consultoria', 'Loja física ou e-commerce', 'Serviços locais (salão, academia, oficina…)',
        'Imobiliária ou construção', 'Restaurante ou delivery', 'Agência ou serviços para empresas'] }] },

    { stage: 'Negócio', title: 'Em que momento o negócio está?', intro: 'Queremos entender se já existe uma operação para analisar.',
      groups: [{ type: 'single', name: 'momento', required: true, options: [
        'Já vende com consistência', 'Já vende, mas de forma irregular', 'Está começando a vender', 'Ainda está validando a ideia'] }] },

    { stage: 'Negócio', title: 'O que você vende hoje?', intro: 'Pode marcar até 4.',
      groups: [{ type: 'multi', name: 'ofertas', required: true, max: 4, cols: 2, options: [
        'Atendimento ou procedimento', 'Mentoria ou consultoria', 'Curso ou produto digital', 'Produto físico',
        'Evento, palestra ou retiro', 'Assinatura ou plano recorrente', 'Projeto sob medida'] }] },

    { stage: 'Negócio', title: 'Qual é o seu carro-chefe?', intro: 'O produto ou serviço que mais vende, e quanto custa em média.',
      groups: [
        { type: 'text', name: 'carroChefe', label: 'Produto ou serviço principal', placeholder: 'Ex.: Método MP, botox, consultoria mensal', required: true },
        { type: 'single', name: 'ticket', label: 'Valor médio', required: true, cols: 2, options: [
          'Até R$ 300', 'De R$ 300 a R$ 1.000', 'De R$ 1.000 a R$ 3.000', 'De R$ 3.000 a R$ 10.000', 'Acima de R$ 10.000'] }
      ] },

    { stage: 'Operação', title: 'Por onde os clientes chegam até você?', intro: 'Marque todos os canais que você usa.',
      groups: [{ type: 'multi', name: 'canais', required: true, cols: 2, options: [
        'Instagram', 'WhatsApp', 'Grupos de WhatsApp', 'YouTube', 'TikTok', 'LinkedIn', 'Site ou Google', 'Anúncios pagos (Meta ou Google)', 'Indicação', 'Eventos e palestras'] }] },

    { stage: 'Operação', title: 'Quantos números de WhatsApp você usa no negócio?', intro: 'Isso muda como a central de atendimento é montada.',
      showIf: function (a) { return has(a.canais, 'WhatsApp'); },
      groups: [{ type: 'single', name: 'whatsNumeros', required: true, options: ['1 número', '2 números', '3 ou mais'] }] },

    { stage: 'Operação', title: 'Qual é o volume de contatos?', intro: 'Uma estimativa já ajuda a calcular o retorno.',
      groups: [
        { type: 'single', name: 'volume', label: 'Pessoas novas que te procuram por mês', required: true, cols: 2, options: ['Até 20', 'De 20 a 50', 'De 50 a 150', 'De 150 a 500', 'Mais de 500'] },
        { type: 'single', name: 'conversao', label: 'De cada 10 que te procuram, quantas compram?', required: true, cols: 2, options: ['1 ou menos', '2 ou 3', '4 ou 5', '6 ou mais', 'Não sei'] }
      ] },

    { stage: 'Operação', title: 'Quem cuida do atendimento e das vendas hoje?', intro: 'Sem certo ou errado: é para desenhar a solução do tamanho certo.',
      groups: [{ type: 'single', name: 'equipe', required: true, options: ['Só eu', 'Eu e mais 1 pessoa', 'Uma equipe de 2 a 5 pessoas', 'Uma equipe de 6 ou mais'] }] },

    { stage: 'Operação', title: 'Quais funções existem na equipe?', intro: 'Marque as que já existem hoje.',
      showIf: function (a) { return a.equipe && a.equipe !== 'Só eu'; },
      groups: [{ type: 'multi', name: 'funcoes', required: true, cols: 2, options: [
        'Recepção ou atendimento', 'Vendas ou comercial', 'Profissionais que executam o serviço', 'Social media ou marketing', 'Financeiro ou administrativo'] }] },

    { stage: 'Operação', title: 'Que ferramentas você usa hoje?', intro: 'Marque todas. Ajuda a calcular quanto você já gasta e o que pode ser substituído.',
      groups: [{ type: 'multi', name: 'ferramentas', required: true, cols: 2, options: [
        'Planilhas', 'WhatsApp Business', 'Um CRM', 'ManyChat ou automação de Instagram', 'Agenda online', 'Hotmart, Kiwify ou similar', 'Nenhuma ferramenta'] }] },

    { stage: 'Gargalo', title: 'O que mais limita o crescimento hoje?', intro: 'Escolha até 3 pontos.',
      groups: [{ type: 'multi', name: 'gargalos', required: true, max: 3, cols: 2, options: [
        'Responder rápido quem chega', 'Retomar quem pediu orçamento', 'Buscar clientes novos (prospecção)', 'Agenda e confirmações',
        'Conteúdo e marketing', 'Saber de onde vêm as vendas', 'Organização e processos', 'Produção e entrega', 'Faço tudo sozinha(o)'] }] },

    { stage: 'Gargalo', title: 'O que acontece se nada mudar?', intro: 'Conte com suas palavras o impacto na rotina, nas vendas ou no crescimento.',
      groups: [{ type: 'textarea', name: 'impacto', label: 'Impacto do gargalo', required: true, placeholder: 'Ex.: perco oportunidades porque não consigo acompanhar todos os contatos.' }] },

    { stage: 'Objetivo', title: 'Como seria o cenário ideal em 90 dias?', intro: 'Escolha até 2 e, se quiser, descreva em uma frase.',
      groups: [
        { type: 'multi', name: 'objetivos', required: true, max: 2, cols: 2, options: [
          'Responder todo mundo em minutos', 'Vender mais sem aumentar a equipe', 'Agenda cheia e organizada', 'Tempo livre para o que só eu faço', 'Visão clara dos números', 'Lançar ou escalar um produto'] },
        { type: 'text', name: 'cenario', label: 'Em uma frase (opcional)', placeholder: 'Ex.: quero atender, gravar e ensinar enquanto a operação roda.' }
      ] },

    { stage: 'Objetivo', title: 'O que te faria dizer “uau”?', intro: 'Um recurso que encantaria você e seus clientes.',
      groups: [{ type: 'single', name: 'uau', required: true, options: [
        'Mostrar ao cliente, num simulador, o que vai ser feito', 'Um quiz que já qualifica quem chega', 'Uma calculadora que mostra quanto o cliente ganha ou economiza',
        'Um catálogo bonito com pedido pelo WhatsApp', 'Agendamento online que se organiza sozinho', 'Uma linha do tempo para o cliente acompanhar o projeto', 'Ainda não sei, me surpreenda'] }] },

    { stage: 'Marca', title: 'Como é a sua marca?', intro: 'Usamos isso para a demonstração já sair com a sua cara. Tudo opcional, menos o jeito de falar.',
      groups: [
        { type: 'single', name: 'tratamento', label: 'Como você fala com seus clientes?', required: true, cols: 2, options: ['Por “você”', 'Por “tu”'] },
        { type: 'text', name: 'perfil', label: '@ do Instagram ou site (opcional)', placeholder: '@suamarca', half: true },
        { type: 'color', name: 'corPrincipal', label: 'Cor principal (opcional)', half: true }
      ] },

    { stage: 'Decisão', title: 'Qual faixa de investimento está sendo considerada?', intro: 'Não é uma proposta. Serve para avaliar se expectativa e escopo podem conversar.',
      groups: [{ type: 'single', name: 'orcamento', required: true, options: [
        'Até R$ 3 mil', 'De R$ 3 mil a R$ 6 mil', 'De R$ 6 mil a R$ 12 mil', 'De R$ 12 mil a R$ 25 mil', 'Acima de R$ 25 mil', 'Ainda não existe orçamento definido'] }] },

    { stage: 'Decisão', title: 'Quando e quem decide?', intro: 'O momento ajuda a priorizar projetos com urgência real.',
      groups: [
        { type: 'single', name: 'timing', label: 'Quando pretende começar', required: true, cols: 2, options: ['Nos próximos 30 dias', 'Entre 1 e 3 meses', 'Entre 3 e 6 meses', 'Só estou pesquisando'] },
        { type: 'single', name: 'decisor', label: 'Quem decide', required: true, cols: 2, options: ['Eu decido', 'Decido com sócio(a)', 'Outra pessoa decide'] }
      ] },

    { stage: 'Decisão', title: 'O que você precisa saber antes de decidir?', intro: 'Escreva suas dúvidas. Elas serão respondidas uma a uma na proposta. (opcional)',
      groups: [{ type: 'textarea', name: 'duvidas', label: 'Suas perguntas', placeholder: 'Ex.: o sistema é meu? Funciona no Instagram e no WhatsApp? Qual é o prazo?' }] },

    { stage: 'Contato', title: 'Como podemos retornar?', intro: 'Use o WhatsApp em que você prefere receber o retorno. O e-mail é opcional.',
      groups: [{ type: 'contact' }] }
  ];

  /* ---------- Utilidades ---------- */
  function has(list, v) { return Array.isArray(list) && list.indexOf(v) >= 0; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]; }); }
  function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }
  var uid = 0;

  /* ---------- Montagem do formulário ---------- */
  var form = document.getElementById('leadForm');
  var stepsBox = document.getElementById('quizSteps');
  var review = document.getElementById('review'), sent = document.getElementById('sent');
  var formProgress = document.getElementById('formProgress'), progressText = document.getElementById('progressText'), stageName = document.getElementById('stageName');
  var reviewList = document.getElementById('reviewList'), whatsappSubmit = document.getElementById('whatsappSubmit');

  function groupHtml(g) {
    var label = g.label ? '<p class="group-label">' + esc(g.label) + '</p>' : '';
    if (g.type === 'text') return '<div class="field' + (g.half ? ' half' : '') + '"><label for="q-' + g.name + '">' + esc(g.label) + '</label><input id="q-' + g.name + '" name="' + g.name + '"' + (g.required ? ' required' : '') + (g.autocomplete ? ' autocomplete="' + g.autocomplete + '"' : '') + ' placeholder="' + esc(g.placeholder || '') + '" maxlength="160" /></div>';
    if (g.type === 'textarea') return '<div class="field"><label for="q-' + g.name + '">' + esc(g.label) + '</label><textarea id="q-' + g.name + '" name="' + g.name + '"' + (g.required ? ' required' : '') + ' placeholder="' + esc(g.placeholder || '') + '" maxlength="1200"></textarea></div>';
    if (g.type === 'color') return '<div class="field half"><label for="q-' + g.name + '">' + esc(g.label) + '</label><div class="color-field"><input id="q-' + g.name + '" name="' + g.name + '" type="color" value="#e91e8c" data-touched="0" /><span>Escolher cor</span></div></div>';
    if (g.type === 'contact') return '<div class="two-fields"><div class="field"><label for="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(00) 00000-0000" /></div><div class="field"><label for="email">E-mail opcional</label><input id="email" name="email" type="email" autocomplete="email" placeholder="voce@empresa.com" /></div></div>' +
      '<label class="consent"><input type="checkbox" name="consentimento" required /><span>Autorizo a Roberta Sena a usar estas respostas para preparar meu diagnóstico e entrar em contato. Meus dados não serão compartilhados.</span></label>';
    var input = g.type === 'multi' ? 'checkbox' : 'radio';
    var opts = g.options.map(function (o, i) {
      var id = 'q-' + g.name + '-' + (uid++);
      return '<label class="answer' + (input === 'checkbox' ? ' multi' : '') + '" for="' + id + '"><input id="' + id + '" type="' + input + '" name="' + g.name + '" value="' + esc(o) + '"' + (g.required && i === 0 ? ' required' : '') + ' /><span>' + esc(o) + '</span></label>';
    }).join('');
    var other = g.other ? '<label class="answer" for="q-' + g.name + '-outro"><input id="q-' + g.name + '-outro" type="radio" name="' + g.name + '" value="__outro" /><span>Outro</span></label><div class="field other-field" hidden><input name="' + g.name + 'Outro" placeholder="Qual?" maxlength="80" /></div>' : '';
    var hint = '';
    return '<div class="answer-group">' + label + hint + '<div class="answers' + (g.cols === 2 ? ' cols-2' : '') + '" data-max="' + (g.max || '') + '">' + opts + other + '</div></div>';
  }

  STEPS.forEach(function (s, i) {
    var sec = document.createElement('section');
    sec.className = 'question'; sec.hidden = true; sec.dataset.index = String(i);
    var body = s.groups.map(groupHtml).join('');
    sec.innerHTML = '<p class="question-no"></p><h3>' + esc(s.title) + '</h3><p class="question-intro">' + esc(s.intro) + '</p>' + body +
      '<p class="form-error" aria-live="polite"></p><div class="form-nav">' + (i ? '<button class="form-button back" type="button">← Voltar</button>' : '') + '<button class="form-button primary next" type="button">' + (i === STEPS.length - 1 ? 'Revisar aplicação →' : 'Continuar →') + '</button></div>';
    stepsBox.appendChild(sec);
  });
  // fecha a dupla de campos lado a lado (cidade/empresa, perfil/cor)
  stepsBox.querySelectorAll('.question').forEach(function (sec) {
    var halves = sec.querySelectorAll(':scope > .field.half, :scope > .two-fields > .field.half');
    if (halves.length === 2 && !halves[0].parentElement.classList.contains('two-fields')) {
      var wrap = document.createElement('div'); wrap.className = 'two-fields';
      halves[0].parentNode.insertBefore(wrap, halves[0]); wrap.appendChild(halves[0]); wrap.appendChild(halves[1]);
    }
  });
  var sections = Array.prototype.slice.call(stepsBox.querySelectorAll('.question'));

  /* ---------- Respostas ---------- */
  function answers() {
    var a = {};
    STEPS.forEach(function (s) {
      s.groups.forEach(function (g) {
        if (g.type === 'contact') {
          a.whatsapp = val('whatsapp'); a.email = val('email');
          a.consentimento = !!form.querySelector('[name="consentimento"]:checked'); return;
        }
        if (g.type === 'multi') { a[g.name] = Array.prototype.map.call(form.querySelectorAll('[name="' + g.name + '"]:checked'), function (x) { return x.value; }); return; }
        if (g.type === 'single') {
          var c = form.querySelector('[name="' + g.name + '"]:checked');
          a[g.name] = c ? (c.value === '__outro' ? (val(g.name + 'Outro') || 'Outro') : c.value) : ''; return;
        }
        if (g.type === 'color') { var el = form.elements[g.name]; a[g.name] = el && el.dataset.touched === '1' ? el.value : ''; return; }
        a[g.name] = val(g.name);
      });
    });
    return a;
  }
  function val(name) { var f = form.elements[name]; return f && f.value != null ? String(f.value).trim() : ''; }
  function visible(i, a) { var s = STEPS[i]; return !s.showIf || s.showIf(a || answers()); }
  function visibleIndexes() { var a = answers(); return STEPS.map(function (_, i) { return i; }).filter(function (i) { return visible(i, a); }); }

  /* ---------- Navegação ---------- */
  var current = 0;
  function validStep(i) {
    var sec = sections[i], ok = true, msg = 'Preencha esta etapa para continuar.';
    STEPS[i].groups.forEach(function (g) {
      if (!g.required && g.type !== 'contact') return;
      if (g.type === 'single' || g.type === 'multi') {
        var c = sec.querySelectorAll('[name="' + g.name + '"]:checked');
        if (!c.length) ok = false;
        if (g.other && c[0] && c[0].value === '__outro' && !val(g.name + 'Outro')) ok = false;
      } else if (g.type === 'contact') {
        var w = val('whatsapp').replace(/\D/g, '');
        if (w.length < 10) { ok = false; msg = 'Confira o WhatsApp com DDD.'; }
        var e = form.elements.email; if (e.value && !e.checkValidity()) { ok = false; msg = 'Confira o e-mail.'; }
        if (!sec.querySelector('[name="consentimento"]:checked')) { ok = false; msg = msg === 'Preencha esta etapa para continuar.' ? 'Marque a autorização para continuar.' : msg; }
      } else if (!val(g.name)) ok = false;
    });
    sec.querySelector('.form-error').textContent = ok ? '' : msg;
    return ok;
  }
  function showStep(i) {
    current = i;
    var vis = visibleIndexes(), pos = vis.indexOf(i);
    sections.forEach(function (s, k) { s.hidden = k !== i; });
    review.hidden = true; sent.hidden = true;
    stageName.textContent = STEPS[i].stage;
    progressText.textContent = 'Pergunta ' + (pos + 1) + ' de ' + vis.length;
    formProgress.style.width = ((pos + 1) / vis.length * 100) + '%';
    sections[i].querySelector('.question-no').textContent = String(pos + 1).padStart(2, '0') + ' · ' + STEPS[i].stage;
    var h = sections[i].querySelector('h3'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    var panel = form.closest('.form-dialog'); if (panel) panel.scrollTop = 0;
  }
  function go(dir) {
    var vis = visibleIndexes(), pos = vis.indexOf(current);
    if (dir > 0 && pos === vis.length - 1) return showReview();
    var n = vis[Math.max(0, Math.min(vis.length - 1, pos + dir))];
    showStep(n);
  }

  form.addEventListener('click', function (e) {
    if (e.target.closest('.next')) { if (validStep(current)) go(1); }
    else if (e.target.closest('.back')) go(-1);
  });
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type === 'checkbox' && t.name !== 'consentimento') {
      var box = t.closest('.answers'), max = Number(box.dataset.max || 0);
      if (max) {
        var checked = box.querySelectorAll('input:checked');
        box.querySelectorAll('input:not(:checked)').forEach(function (x) { x.disabled = checked.length >= max; x.closest('.answer').classList.toggle('off', checked.length >= max); });
      }
    }
    if (t.type === 'radio') {
      var otherField = t.closest('.answers').querySelector('.other-field');
      if (otherField) { otherField.hidden = t.value !== '__outro'; if (!otherField.hidden) otherField.querySelector('input').focus(); }
      // avanço automático quando a etapa tem um único grupo de escolha única
      var s = STEPS[current];
      if (s.groups.length === 1 && s.groups[0].type === 'single' && t.value !== '__outro') window.setTimeout(function () { if (validStep(current)) go(1); }, 260);
    }
    if (t.type === 'color') t.dataset.touched = '1';
    sections[current].querySelector('.form-error').textContent = '';
  });

  /* ---------- Briefing (formato da fábrica da Jornada do Lead) ---------- */
  var TICKET = { 'Até R$ 300': 200, 'De R$ 300 a R$ 1.000': 650, 'De R$ 1.000 a R$ 3.000': 2000, 'De R$ 3.000 a R$ 10.000': 6000, 'Acima de R$ 10.000': 12000 };
  var VOLUME = { 'Até 20': 15, 'De 20 a 50': 35, 'De 50 a 150': 100, 'De 150 a 500': 300, 'Mais de 500': 700 };
  var CONV = { '1 ou menos': 10, '2 ou 3': 25, '4 ou 5': 45, '6 ou mais': 65 };
  var CANAL = { 'Instagram': 'instagram', 'WhatsApp': 'whatsapp', 'Grupos de WhatsApp': 'grupos_whatsapp', 'YouTube': 'youtube', 'TikTok': 'tiktok', 'LinkedIn': 'linkedin', 'Site ou Google': 'site', 'Anúncios pagos (Meta ou Google)': 'anuncios_meta', 'Indicação': 'outro', 'Eventos e palestras': 'outro' };
  var UAU = { 'Mostrar ao cliente, num simulador, o que vai ser feito': 'hotspot-simulator', 'Um quiz que já qualifica quem chega': 'quiz', 'Uma calculadora que mostra quanto o cliente ganha ou economiza': 'calculator', 'Um catálogo bonito com pedido pelo WhatsApp': 'catalog', 'Agendamento online que se organiza sozinho': 'booking', 'Uma linha do tempo para o cliente acompanhar o projeto': 'timeline' };
  var SIZE = { 'Só eu': 'solo', 'Eu e mais 1 pessoa': '2', 'Uma equipe de 2 a 5 pessoas': '2-5', 'Uma equipe de 6 ou mais': '6+' };
  function t(v) { return { value: v === '' || v == null ? null : v, origin: 'informado' }; }

  function toBriefing(a) {
    var questions = (a.duvidas || '').split(/\n+|\?\s*/).map(function (q) { return q.trim(); }).filter(function (q) { return q.length > 3; }).map(function (q) { return /\?$/.test(q) ? q : q + '?'; });
    return {
      business: { name: t(a.empresa), niche: t(a.segmento), city: t(a.cidade), size: t(SIZE[a.equipe] || null) },
      offers: { value: [{ name: a.carroChefe, format: (a.ofertas || [])[0] || null, ticket: TICKET[a.ticket] || null }].concat((a.ofertas || []).slice(1).map(function (o) { return { name: o, format: o, ticket: null }; })), origin: 'informado' },
      channels: { value: (a.canais || []).map(function (c) { return { name: CANAL[c] || 'outro', detail: c === 'WhatsApp' ? (a.whatsNumeros || null) : (CANAL[c] === 'outro' ? c : null) }; }), origin: 'informado' },
      currentTools: { value: a.ferramentas || [], origin: 'informado' },
      team: { hasHumanTeam: t(a.equipe ? a.equipe !== 'Só eu' : null), roles: t(a.funcoes && a.funcoes.length ? a.funcoes : null) },
      pains: { value: (a.gargalos || []).concat(a.impacto ? [a.impacto] : []), origin: 'informado' },
      goals: { value: (a.objetivos || []).concat(a.cenario ? [a.cenario] : []), origin: 'informado' },
      volume: { leadsPerMonth: t(VOLUME[a.volume] || null), conversionPct: t(CONV[a.conversao] || null) },
      wow: { value: UAU[a.uau] || null, origin: UAU[a.uau] ? 'informado' : 'padrao' },
      brand: { primary: t(a.corPrincipal || null), accent: t(null), voice: t(a.tratamento === 'Por “tu”' ? 'tu' : 'voce') },
      decision: { decider: t(a.decisor), desiredDeadline: t(a.timing), budgetHint: t(a.orcamento) },
      leadQuestions: questions,
      notes: ['Momento: ' + a.momento, a.perfil ? 'Perfil/site: ' + a.perfil : '', a.uau === 'Ainda não sei, me surpreenda' ? 'Uau: deixou para a Roberta sugerir' : ''].filter(Boolean).join(' · ')
    };
  }

  /* ---------- Revisão e envio ---------- */
  function rows(a) {
    return [
      ['Nome', a.nome], ['Negócio', a.empresa + (a.cidade ? ' · ' + a.cidade : '')], ['Segmento', a.segmento], ['Momento', a.momento],
      ['Vende', (a.ofertas || []).join(', ')], ['Carro-chefe', a.carroChefe + ' · ' + a.ticket], ['Canais', (a.canais || []).join(', ') + (a.whatsNumeros ? ' (' + a.whatsNumeros + ')' : '')],
      ['Volume', a.volume + ' por mês · compram ' + a.conversao + ' de 10'], ['Equipe', a.equipe + (a.funcoes && a.funcoes.length ? ' · ' + a.funcoes.join(', ') : '')],
      ['Ferramentas', (a.ferramentas || []).join(', ')], ['Gargalos', (a.gargalos || []).join(', ')], ['Impacto', a.impacto],
      ['Objetivo', (a.objetivos || []).join(', ') + (a.cenario ? ' · ' + a.cenario : '')], ['Uau', a.uau], ['Marca', a.tratamento + (a.perfil ? ' · ' + a.perfil : '')],
      ['Investimento', a.orcamento], ['Quando · quem decide', a.timing + ' · ' + a.decisor], ['Dúvidas', a.duvidas || 'Nenhuma'],
      ['WhatsApp', a.whatsapp], ['E-mail', a.email || 'Não informado']
    ];
  }
  function showReview() {
    var a = answers();
    reviewList.innerHTML = rows(a).map(function (r) { return '<div class="review-row"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('');
    var text = ['Olá, Roberta! Quero aplicar para o diagnóstico de IA.', ''].concat(rows(a).map(function (r) { return r[0] + ': ' + r[1]; })).join('\n');
    whatsappSubmit.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text.slice(0, 3500));
    sections.forEach(function (s) { s.hidden = true; });
    review.hidden = false; stageName.textContent = 'Revisão'; progressText.textContent = 'Aplicação completa'; formProgress.style.width = '100%';
    var h = review.querySelector('h3'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
  }

  function origem() { return new URLSearchParams(window.location.search).get('origem') || 'pagina_direta'; }

  function sendToJornada(a) {
    if (!JORNADA_ENDPOINT) return;
    var payload = { source: 'quiz', quiz: QUIZ_ID, origem: origem(), submittedAt: new Date().toISOString(),
      contact: { nome: a.nome, whatsapp: a.whatsapp, email: a.email || null }, consent: a.consentimento, answers: a, briefing: toBriefing(a), website: val('website') };
    fetch(JORNADA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(function () {});
  }

  function sendToGoogleForms(a) {
    var p = new URLSearchParams();
    p.set('entry.2030267324', a.nome); p.set('entry.1248167514', a.empresa); p.set('entry.382448882', a.segmento); p.set('entry.677377730', a.momento);
    p.set('entry.380242697', (a.gargalos || []).join(', ')); p.set('entry.438854789', a.impacto + ' | Objetivo: ' + (a.objetivos || []).join(', ') + ' | Uau: ' + a.uau);
    p.set('entry.1277994003', a.orcamento); p.set('entry.1038248767', a.timing); p.set('entry.382937221', a.whatsapp); p.set('entry.110986565', a.email); p.set('entry.735885921', origem());
    p.set('fbzx', '6910060160677394319'); p.set('fvv', '1'); p.set('pageHistory', '0'); p.set('submissionTimestamp', String(Date.now()));
    fetch('https://docs.google.com/forms/d/e/1FAIpQLSeKFmK61dIsO9Gf5FfzTa_ii29isES2lKM4RbdTM5CdIB5tNg/formResponse', { method: 'POST', mode: 'no-cors', keepalive: true, body: p }).catch(function () {});
  }

  whatsappSubmit.addEventListener('click', function () {
    var a = answers();
    if (val('website')) return; // honeypot preenchido = robô
    sendToJornada(a); sendToGoogleForms(a);
    window.setTimeout(function () { review.hidden = true; sent.hidden = false; var h = sent.querySelector('h3'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }, 120);
  });
  document.getElementById('reviewBack').addEventListener('click', function () { var v = visibleIndexes(); showStep(v[v.length - 1]); });
  document.getElementById('restart').addEventListener('click', function () { showStep(0); });
  form.addEventListener('input', function (e) {
    if (e.target.id !== 'whatsapp') return;
    var d = e.target.value.replace(/\D/g, '').slice(0, 11);
    e.target.value = d.length > 10 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6) : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d;
  });

  showStep(0);
  window.__quiz = { STEPS: STEPS, answers: answers, toBriefing: toBriefing };
})();
