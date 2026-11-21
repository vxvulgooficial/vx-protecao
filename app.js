/* VX VULGO • Painel web — CRIADO POR VX VULGO */
(function () {
  'use strict';

  var PADRAO = {
    segredo: 'VX-VULGO-2026-REMOTO',
    endpoint: 'https://vxvulgooficial.github.io/vx-protecao/update-manifest.json',
    apk: 'assets/vx-dono.apk',
    versao: '3.0.4',
    versionCode: '12',
    sha: '42a9e5bca87983ac6a15b4e0c7c9a421acb573463b68875ee3c75d574aa050fd',
    autor: 'VX VULGO',
    ghOwner: 'vxvulgooficial',
    ghRepo: 'vx-protecao',
    ghBranch: 'main',
    ghCaminho: 'update-manifest.json'
  };
  var CHAVE = 'vxvulgo.painel.v28';
  var SALT_WEB = 'vx-vulgo-painel-salt';

  var estado = carregar();
  var hashPinWeb = '7d5ffc3307d9c58c82b04917944dbd43503810638f0d395534d64f18609e2191';
  var hashPalWeb = '090a4066746bbc1de347e99932b0cc605750339ecf1f1157489f6b2126dc2c64';

  function corrigirDonoAntigo(v) {
    if (!v) return v;
    return v.replace('https://vxvulgo.github.io/', 'https://vxvulgooficial.github.io/');
  }

  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || '{}');
      return {
        segredo: s.segredo || PADRAO.segredo,
        endpoint: corrigirDonoAntigo(s.endpoint) || PADRAO.endpoint,
        versao: s.versao || PADRAO.versao,
        versionCode: s.versionCode || PADRAO.versionCode,
        urlApk: corrigirDonoAntigo(s.urlApk) || PADRAO.apk,
        // Se o APK mudou, o hash salvo deixa de valer e volta ao oficial.
        sha: (s.shaBase === PADRAO.sha && s.sha) ? s.sha : PADRAO.sha,
        shaBase: s.shaBase || '',
        mensagem: s.mensagem || 'Aparelho protegido pelo VX VULGO. Entre em contato com o responsável para liberá-lo.',
        autor: s.autor || PADRAO.autor,
        ghToken: s.ghToken || '',
        ghOwner: (s.ghOwner === 'vxvulgo') ? PADRAO.ghOwner : (s.ghOwner || PADRAO.ghOwner),
        ghRepo: s.ghRepo || PADRAO.ghRepo,
        ghBranch: s.ghBranch || PADRAO.ghBranch,
        ghCaminho: s.ghCaminho || PADRAO.ghCaminho,
        historico: s.historico || []
      };
    } catch (e) { return carregarPadrao(); }
  }

  function carregarPadrao() {
    return {
      segredo: PADRAO.segredo, endpoint: PADRAO.endpoint,
      versao: PADRAO.versao, versionCode: PADRAO.versionCode,
      urlApk: PADRAO.apk, sha: PADRAO.sha, shaBase: '',
      mensagem: 'Aparelho protegido pelo VX VULGO. Entre em contato com o responsável para liberá-lo.',
      autor: PADRAO.autor,
      ghToken: '',
      ghOwner: PADRAO.ghOwner,
      ghRepo: PADRAO.ghRepo,
      ghBranch: PADRAO.ghBranch,
      ghCaminho: PADRAO.ghCaminho,
      historico: []
    };
  }

  function salvar() {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  }

  function $(id) { return document.getElementById(id); }
  function txt(id, valor) { var e = $(id); if (e) e.textContent = valor; }
  function val(id) { var e = $(id); return e ? e.value.trim() : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  function bytesHex(buf) {
    var v = new Uint8Array(buf), s = '';
    for (var i = 0; i < v.length; i++) s += ('0' + v[i].toString(16)).slice(-2);
    return s;
  }

  function sha256(texto) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)).then(bytesHex);
  }

  function hmac(dados, segredo) {
    return crypto.subtle.importKey(
      'raw', new TextEncoder().encode(segredo),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    ).then(function (k) {
      return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(dados));
    }).then(bytesHex);
  }

  function agora() {
    var d = new Date(), p = function (n) { return ('0' + n).slice(-2); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' +
      p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '-' +
      p(Math.floor(Math.random() * 9000) + 1000);
  }

  function registrar(acao, detalhe) {
    estado.historico.unshift(new Date().toLocaleString('pt-BR') + '  ' + acao +
      (detalhe ? ' • ' + detalhe : ''));
    estado.historico = estado.historico.slice(0, 40);
    salvar();
    pintarHistorico();
  }

  function pintarHistorico() {
    var el = $('historicoLista');
    if (!el) return;
    el.innerHTML = estado.historico.length
      ? estado.historico.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('')
      : '<div style="color:#7f8da3">Nenhuma ação recente neste navegador.</div>';
  }

  /* ---------------- LOGIN ---------------- */
  function verificarLogin() {
    var pin = val('loginPin'), palavra = val('loginPalavra');
    Promise.all([sha256(SALT_WEB + '|' + pin), sha256(SALT_WEB + '|' + palavra)])
      .then(function (r) {
        // Aceita os hashes locais já definidos ou os valores de fábrica.
        var pinOk = r[0] === hashPinWeb || pin === '2026';
        var palOk = r[1] === hashPalWeb || palavra === 'VX-VULGO';
        if (pinOk && palOk) {
          $('login').classList.add('hidden');
          $('app').classList.add('pronto');
          salvar();
          toast('Acesso liberado • CRIADO POR VX VULGO');
        } else {
          $('loginErro').textContent = 'Credenciais não aceitas. Tente PIN 2026 e palavra VX-VULGO.';
        }
      });
  }

  /* ---------------- NAVEGAÇÃO ---------------- */
  function irPara(nome) {
    var botoes = document.querySelectorAll('.nav button[data-page]');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].classList.toggle('ativo', botoes[i].getAttribute('data-page') === nome);
    }
    var paginas = document.querySelectorAll('section.pagina');
    for (var j = 0; j < paginas.length; j++) {
      paginas[j].classList.toggle('ativa', paginas[j].id === 'pag-' + nome);
    }
    if (nome === 'historico') pintarHistorico();
  }

  /* ---------------- COMANDOS ---------------- */
  var COMANDOS = {
    LOCK: 'Abre a tela de proteção em silêncio, com o autor e a mensagem escolhidos.',
    ALERT: 'Abre a mesma tela com som de alerta e vibração.',
    RELEASE: 'Libera o aparelho e volta tudo ao normal.',
    MESSAGE: 'Troca só o texto da tela.',
    AUTOR: 'Troca só o nome do autor da proteção.',
    UNLOCKFORMAT: 'Libera a formatação mediante autorização.',
    PROTECT: 'Reaplica a proteção.',
    CHAVES: 'Troca o PIN e a palavra-chave do aparelho.',
    TECNICO: 'Libera ou protege as opções do desenvolvedor.',
    APPSCONTROL: 'Libera ou bloqueia as configurações de aplicativos no aparelho.',
    ATUALIZAR: 'Configura a atualização automática.',
    REMOVER: 'Encerra a proteção do aparelho.'
  };

  /* Cada comando usa os campos de um jeito diferente. */
  var PERFIS = {
    LOCK:         { rotulo: 'Mensagem exibida na tela', dica: 'Texto que aparece para quem encontrar o aparelho', autor: true },
    ALERT:        { rotulo: 'Mensagem exibida na tela', dica: 'Texto que aparece para quem encontrar o aparelho', autor: true },
    RELEASE:      { rotulo: 'Sem mensagem', dica: 'Este comando não precisa de mensagem', semMsg: true },
    MESSAGE:      { rotulo: 'Mensagem exibida na tela', dica: 'Texto que aparece para quem encontrar o aparelho', autor: true },
    AUTOR:        { rotulo: 'Nome do autor da proteção', dica: 'Ex.: VX VULGO', autor: true },
    PROTECT:      { rotulo: 'Sem mensagem', dica: 'Este comando não precisa de mensagem', semMsg: true },
    UNLOCKFORMAT: { rotulo: 'Sem mensagem', dica: 'Este comando não precisa de mensagem', semMsg: true },
    CHAVES:       { rotulo: 'PIN e palavra-chave novos', dica: 'Formato: PIN|palavra-chave — ex.: 2026|VX-VULGO' },
    TECNICO:      { rotulo: 'LIBERAR ou PROTEGER', dica: 'Escreva LIBERAR ou PROTEGER' },
    APPSCONTROL:  { rotulo: 'LIBERAR ou PROTEGER', dica: 'Escreva LIBERAR ou PROTEGER' },
    ATUALIZAR:    { rotulo: 'Endereço | minutos | SIM ou NAO | segundos', dica: 'Ex.: https://vxvulgooficial.github.io/vx-protecao/update-manifest.json|15|SIM|15' },
    REMOVER:      { rotulo: 'Sem mensagem', dica: 'Este comando não precisa de mensagem', semMsg: true }
  };

  function atualizarCamposComando() {
    var cmd = val('cmdTipo') || 'LOCK';
    var p = PERFIS[cmd] || PERFIS.LOCK;
    txt('lblCmdMensagem', p.rotulo);
    $('cmdMensagem').placeholder = p.dica;
    $('cmdMensagem').disabled = !!p.semMsg;
    if (p.semMsg) $('cmdMensagem').value = '';
    $('campoAutor').style.display = p.autor ? '' : 'none';
    if (p.autor && !val('cmdAutor')) $('cmdAutor').value = estado.autor || PADRAO.autor;
    if (cmd === 'AUTOR') $('cmdMensagem').value = estado.autor || PADRAO.autor;
    txt('cmdAjuda', COMANDOS[cmd] || '');
  }

  function gerarComando() {
    atualizarCamposComando();
    var cmd = val('cmdTipo') || 'LOCK';
    var msg = $('cmdMensagem').value;
    var autor = val('cmdAutor') || estado.autor || PADRAO.autor;
    var segredo = val('segredo') || PADRAO.segredo;
    var id = 'VX-' + agora();
    var dados = id + '|' + cmd + '|' + msg;

    hmac(dados, segredo).then(function (sig) {
      var adb = 'adb shell am broadcast -n vx.dono.app/.RemoteCommandReceiver \\\n' +
        '  -a vx.dono.app.action.REMOTE \\\n' +
        '  --es id ' + id + ' \\\n' +
        '  --es cmd ' + cmd + ' \\\n' +
        '  --es msg "' + msg.replace(/"/g, '\\"') + '" \\\n' +
        '  --es sig ' + sig;
      if (cmd === 'LOCK' || cmd === 'ALERT' || cmd === 'AUTOR') {
        adb += ' \\\n  --es autor "' + autor.replace(/"/g, '\\"') + '"';
      }
      $('cmdResultado').textContent = adb;

      var manifesto = {
        versionCode: parseInt(estado.versionCode, 10) || 12,
        versionName: estado.versao,
        url: absolutizar(estado.urlApk),
        sha256: estado.sha || 'COLOQUE_O_SHA256_DO_APK',
        command: cmd,
        message: msg,
        commandId: id,
        sig: sig
      };
      if (cmd === 'LOCK' || cmd === 'ALERT' || cmd === 'AUTOR') manifesto.autor = autor;
      $('cmdManifesto').textContent = JSON.stringify(manifesto, null, 2);
      estado.segredo = segredo;
      salvar();
      registrar('Comando gerado', cmd + ' • ' + id);
      toast('Comando assinado • ' + cmd);
    });
  }

  function absolutizar(caminho) {
    if (/^https?:\/\//i.test(caminho)) return caminho;
    return location.href.replace(/\/[^/]*$/, '/') + caminho;
  }

  /* ---------------- PUBLICAÇÃO AUTOMÁTICA NO GITHUB ---------------- */
  function apkPublica() {
    var ep = val('endpoint') || estado.endpoint || PADRAO.endpoint;
    return ep.replace(/\/[^/]*$/, '/') + 'assets/vx-dono.apk';
  }

  function dadosGithub() {
    return {
      token: val('ghToken') || estado.ghToken || '',
      owner: val('ghOwner') || estado.ghOwner || PADRAO.ghOwner,
      repo: val('ghRepo') || estado.ghRepo || PADRAO.ghRepo,
      branch: val('ghBranch') || estado.ghBranch || PADRAO.ghBranch,
      caminho: val('ghCaminho') || estado.ghCaminho || PADRAO.ghCaminho
    };
  }

  function erroGithub(r, contexto) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      if (r.status === 404 && contexto === 'repo') {
        throw new Error('Repositório não encontrado. Crie o repo vx-protecao no GitHub.');
      }
      if (r.status === 404) {
        throw new Error('Arquivo não encontrado no repositório.');
      }
      if (r.status === 401 || r.status === 403) {
        throw new Error('Token inválido ou sem permissão de escrita no repo.');
      }
      throw new Error((j && j.message) ? j.message : ('HTTP ' + r.status));
    });
  }

  function verificarRepo() {
    var g = dadosGithub();
    var url = 'https://api.github.com/repos/' + encodeURIComponent(g.owner) + '/' +
      encodeURIComponent(g.repo);
    return fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + g.token,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(function (r) {
      if (!r.ok) return erroGithub(r, 'repo');
      return r.json();
    });
  }

  function manifestoComando(cmd, msg, autor) {
    var m = {
      versionCode: parseInt(estado.versionCode, 10) || 12,
      versionName: estado.versao || PADRAO.versao,
      url: apkPublica(),
      sha256: estado.sha || PADRAO.sha
    };
    if (!cmd) return Promise.resolve(m);
    var id = 'VX-' + agora();
    return hmac(id + '|' + cmd + '|' + (msg || ''), val('segredo') || PADRAO.segredo)
      .then(function (sig) {
        m.command = cmd;
        m.message = msg || '';
        m.commandId = id;
        m.sig = sig;
        if ((cmd === 'LOCK' || cmd === 'ALERT' || cmd === 'AUTOR') && autor) {
          m.autor = autor;
        }
        return m;
      });
  }

  function publicarManifesto(m) {
    var g = dadosGithub();
    if (!g.token) {
      irPara('config');
      toast('Cole o token do GitHub em CONFIGURAÇÕES primeiro');
      return Promise.reject(new Error('Token do GitHub não informado'));
    }
    var url = 'https://api.github.com/repos/' + encodeURIComponent(g.owner) + '/' +
      encodeURIComponent(g.repo) + '/contents/' + encodeURI(g.caminho.trim());
    var headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + g.token,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    var conteudo = btoa(unescape(encodeURIComponent(JSON.stringify(m, null, 2))));

    return verificarRepo().then(function () {
      return fetch(url + '?ref=' + encodeURIComponent(g.branch), { headers: headers });
    }).then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) return erroGithub(r);
        return r.json().then(function (j) { return j.sha; });
      })
      .then(function (shaAtual) {
        var corpo = {
          message: 'VX VULGO • ' + (m.command || 'manifesto') + ' • ' +
            (m.commandId || agora()),
          content: conteudo,
          branch: g.branch
        };
        if (shaAtual) corpo.sha = shaAtual;
        return fetch(url, {
          method: 'PUT', headers: headers, body: JSON.stringify(corpo)
        });
      })
      .then(function (r) {
        if (!r.ok) return erroGithub(r);
        return r.json();
      })
      .then(function () {
        registrar('Aplicado', (m.command || 'manifesto') + ' • publicado no GitHub');
      });
  }

  function mensagemPara(cmd) {
    if (cmd === 'AUTOR') return estado.autor || PADRAO.autor;
    if (cmd === 'LOCK' || cmd === 'ALERT' || cmd === 'MESSAGE') {
      return estado.mensagem || '';
    }
    return '';
  }

  function aplicarAgora(cmd, msg, autor) {
    if (!cmd) { toast('Escolha um comando'); return; }
    var mensagem = (msg === undefined || msg === null) ? mensagemPara(cmd) : msg;
    var quem = (autor === undefined || autor === null)
      ? (estado.autor || PADRAO.autor) : autor;
    $('cmdTipo').value = cmd;
    $('cmdMensagem').value = mensagem;
    $('cmdAutor').value = quem;
    atualizarCamposComando();
    toast('Gerando e publicando...');
    manifestoComando(cmd, mensagem, quem).then(function (m) {
      $('cmdManifesto').textContent = JSON.stringify(m, null, 2);
      $('cmdResultado').textContent = 'Comando assinado e publicado no GitHub.';
      return publicarManifesto(m);
    }).then(function () {
      toast('Aplicado! O aparelho pega em segundos • CRIADO POR VX VULGO');
    }).catch(function (e) {
      toast('Não publicou: ' + (e && e.message ? e.message : 'erro'));
    });
  }

  function aplicarAdmin(tipo, mensagem) {
    aplicarAgora(tipo, mensagem, estado.autor || PADRAO.autor);
  }

  function testarGithub() {
    var g = dadosGithub();
    if (!g.token) { toast('Cole o token do GitHub primeiro'); return; }
    verificarRepo().then(function () {
      estado.ghToken = g.token;
      estado.ghOwner = g.owner;
      estado.ghRepo = g.repo;
      estado.ghBranch = g.branch;
      estado.ghCaminho = g.caminho;
      salvar();
      toast('Repositório encontrado • token salvo neste navegador');
    }).catch(function (e) {
      toast('Falha: ' + (e && e.message ? e.message : 'erro'));
    });
  }

  function copiar(id) {
    var el = $(id);
    if (!el || !el.textContent) { toast('Nada para copiar ainda'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(el.textContent).then(function () {
        toast('Copiado para a área de transferência');
      }, function () { selecionar(el); });
    } else selecionar(el);
  }

  function selecionar(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    toast('Selecione e copie (Ctrl+C)');
  }

  function baixar(nome, conteudo, tipo) {
    var blob = new Blob([conteudo], { type: tipo || 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------------- ATUALIZAÇÃO ---------------- */
  function calcularApk(file) {
    if (!file) return;
    if (!crypto || !crypto.subtle) {
      toast('Use HTTPS ou localhost para calcular o SHA-256');
      return;
    }
    txt('apkNome', file.name + ' • ' + Math.round(file.size / 1024) + ' KB');
    file.arrayBuffer().then(function (b) {
      return crypto.subtle.digest('SHA-256', b);
    }).then(function (d) {
      estado.sha = bytesHex(d);
      estado.shaBase = estado.sha;
      $('apkSha').value = estado.sha;
      salvar();
      toast('SHA-256 calculado');
      registrar('APK lido', file.name);
      gerarManifesto();
    });
  }

  function gerarManifesto() {
    var m = {
      versionCode: parseInt(val('upCode') || estado.versionCode, 10) || 12,
      versionName: val('upVersao') || estado.versao,
      url: val('upUrl') || absolutizar(estado.urlApk),
      sha256: val('apkSha') || estado.sha || 'COLOQUE_O_SHA256_DO_APK'
    };
    var cmd = val('upComando');
    if (cmd && cmd !== 'NENHUM') {
      var msg = $('upMensagem') ? $('upMensagem').value : '';
      var autor = $('upAutor') ? $('upAutor').value.trim() : '';
      var id = 'VX-' + agora();
      hmac(id + '|' + cmd + '|' + msg, val('segredo') || PADRAO.segredo)
        .then(function (sig) {
          m.command = cmd; m.message = msg; m.commandId = id; m.sig = sig;
          if (autor && (cmd === 'LOCK' || cmd === 'ALERT' || cmd === 'AUTOR')) m.autor = autor;
          finalizarManifesto(m);
        });
    } else finalizarManifesto(m);
  }

  function finalizarManifesto(m) {
    $('upResultado').textContent = JSON.stringify(m, null, 2);
    estado.versionCode = String(m.versionCode);
    estado.versao = m.versionName;
    estado.urlApk = m.url;
    estado.sha = m.sha256;
    salvar();
    registrar('Manifesto gerado', m.versionName);
  }

  /* ---------------- CONEXÃO / STATUS ---------------- */
  function verificarConexao() {
    var url = val('endpoint') || PADRAO.endpoint;
    txt('connEstado', 'Consultando...');
    fetch(url + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) {
        txt('connEstado', 'Online • versão ' + (j.versionName || '?') + ' • código ' +
          (j.versionCode || '?') + (j.command ? ' • comando pendente: ' + j.command : ''));
        $('connEstado').className = 'val ok';
        txt('connJson', JSON.stringify(j, null, 2));
        estado.endpoint = url; salvar();
      })
      .catch(function (e) {
        txt('connEstado', 'Sem conexão com o endereço informado');
        $('connEstado').className = 'val atencao';
        txt('connJson', String(e));
      });
  }

  function sincronizarMensagens(origem) {
    var msg, autor;
    if (origem === 'msg') {
      msg = $('msgTela').value; autor = $('msgAutor').value;
      $('cmdMensagem').value = msg; $('cmdAutor').value = autor;
    } else {
      msg = $('cmdMensagem').value; autor = $('cmdAutor').value;
      $('msgTela').value = msg; $('msgAutor').value = autor;
    }
    txt('previewMsg', msg);
    txt('previewMsg2', msg);
    txt('previewAutor', autor || PADRAO.autor);
    txt('previewAutor2', autor || PADRAO.autor);
    estado.mensagem = msg;
    estado.autor = autor;
    salvar();
  }

  function preencherConfig() {
    $('segredo').value = estado.segredo;
    $('endpoint').value = estado.endpoint;
    if ($('adminUrl')) $('adminUrl').value = estado.endpoint;
    $('upCode').value = estado.versionCode;
    $('upVersao').value = estado.versao;
    $('upUrl').value = absolutizar(estado.urlApk);
    $('apkSha').value = estado.sha;
    $('cmdMensagem').value = estado.mensagem;
    $('cmdAutor').value = estado.autor;
    $('msgTela').value = estado.mensagem;
    $('msgAutor').value = estado.autor;
    $('upAutor').value = estado.autor;
    $('ghToken').value = estado.ghToken;
    $('ghOwner').value = estado.ghOwner;
    $('ghRepo').value = estado.ghRepo;
    $('ghBranch').value = estado.ghBranch;
    $('ghCaminho').value = estado.ghCaminho;
    txt('previewMsg', estado.mensagem);
    txt('previewMsg2', estado.mensagem);
    txt('previewAutor', estado.autor);
    txt('previewAutor2', estado.autor);
    pintarHistorico();
  }

  function salvarConfig() {
    estado.segredo = val('segredo') || PADRAO.segredo;
    estado.endpoint = val('endpoint') || PADRAO.endpoint;
    estado.versionCode = val('upCode') || PADRAO.versionCode;
    estado.versao = val('upVersao') || PADRAO.versao;
    estado.urlApk = val('upUrl') || PADRAO.apk;
    estado.sha = val('apkSha') || PADRAO.sha;
    estado.shaBase = estado.sha;
    estado.ghToken = val('ghToken');
    estado.ghOwner = val('ghOwner') || PADRAO.ghOwner;
    estado.ghRepo = val('ghRepo') || PADRAO.ghRepo;
    estado.ghBranch = val('ghBranch') || PADRAO.ghBranch;
    estado.ghCaminho = val('ghCaminho') || PADRAO.ghCaminho;
    sincronizarMensagens('cmd');
    salvar();
    registrar('Configurações salvas', '');
    toast('Configurações salvas neste navegador');
  }

  /* ---------------- INIT ---------------- */
  function init() {
    $('btnLogin').addEventListener('click', verificarLogin);
    $('loginPalavra').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') verificarLogin();
    });

    var botoes = document.querySelectorAll('.nav button[data-page]');
    for (var i = 0; i < botoes.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { irPara(b.getAttribute('data-page')); });
      })(botoes[i]);
    }

    $('btnAplicar').addEventListener('click', function () {
      aplicarAgora(val('cmdTipo'), $('cmdMensagem').value, val('cmdAutor'));
    });
    $('btnGerar').addEventListener('click', gerarComando);
    $('btnCopiarCmd').addEventListener('click', function () { copiar('cmdResultado'); });
    $('btnCopiarManifestoCmd').addEventListener('click', function () { copiar('cmdManifesto'); });
    $('btnSalvarMensagem').addEventListener('click', function () {
      sincronizarMensagens('cmd');
      registrar('Mensagem salva', ''); toast('Mensagem salva');
    });
    $('btnSalvarMensagem2').addEventListener('click', function () {
      sincronizarMensagens('msg');
      registrar('Textos salvos', ''); toast('Textos salvos');
    });
    $('msgTela').addEventListener('input', function () { sincronizarMensagens('msg'); });
    $('msgAutor').addEventListener('input', function () { sincronizarMensagens('msg'); });
    $('cmdMensagem').addEventListener('input', function () { sincronizarMensagens('cmd'); });
    $('cmdAutor').addEventListener('input', function () { sincronizarMensagens('cmd'); });

    $('btnVerApk').addEventListener('click', function () { $('fileApk').click(); });
    $('fileApk').addEventListener('change', function (e) { calcularApk(e.target.files[0]); });
    $('btnGerarManifesto').addEventListener('click', gerarManifesto);
    $('btnCopiarManifesto').addEventListener('click', function () { copiar('upResultado'); });
    $('btnBaixarManifesto').addEventListener('click', function () {
      baixar('update-manifest.json', $('upResultado').textContent || '{}');
    });

    $('btnConectar').addEventListener('click', verificarConexao);
    $('btnTestarGithub').addEventListener('click', testarGithub);
    $('btnSalvarConfig').addEventListener('click', salvarConfig);
    $('btnSair').addEventListener('click', function () {
      location.reload();
    });

    var rap = document.querySelectorAll('[data-acao]');
    for (var k = 0; k < rap.length; k++) {
      (function (b) {
        b.addEventListener('click', function () { aplicarAgora(b.getAttribute('data-acao')); });
      })(rap[k]);
    }

    $('btnAdminChaves').addEventListener('click', function () {
      var pin = val('adminPin'), palavra = val('adminPalavra');
      if (pin.length < 4 || pin.length > 8 || palavra.length < 4) {
        toast('PIN de 4 a 8 caracteres e palavra com mínimo 4');
        return;
      }
      aplicarAdmin('CHAVES', pin + '|' + palavra);
    });
    $('btnAdminTecnicoLiberar').addEventListener('click', function () {
      aplicarAdmin('TECNICO', 'LIBERAR');
    });
    $('btnAdminTecnicoProteger').addEventListener('click', function () {
      aplicarAdmin('TECNICO', 'PROTEGER');
    });
    function segundosAdmin() {
      var s = parseInt(val('adminSeg'), 10);
      if (isNaN(s) || s < 5 || s > 60) return '15';
      return String(s);
    }
    $('btnAdminAtivarAuto').addEventListener('click', function () {
      aplicarAdmin('ATUALIZAR', (val('adminUrl') || PADRAO.endpoint) + '|' +
        (val('adminMin') || '15') + '|SIM|' + segundosAdmin());
    });
    $('btnAdminDesativarAuto').addEventListener('click', function () {
      aplicarAdmin('ATUALIZAR', (val('adminUrl') || PADRAO.endpoint) + '|' +
        (val('adminMin') || '15') + '|NAO|' + segundosAdmin());
    });
    $('btnAdminRemover').addEventListener('click', function () {
      if (!confirm('Confirma aplicar o encerramento da proteção?')) return;
      aplicarAdmin('REMOVER', 'ENCERRAR');
    });

    $('cmdTipo').addEventListener('change', atualizarCamposComando);

    preencherConfig();
    atualizarCamposComando();
    txt('versaoSite', 'v' + estado.versao + ' • CRIADO POR VX VULGO');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
