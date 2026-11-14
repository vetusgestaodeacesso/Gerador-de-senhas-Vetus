const CARACTERES = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%&*+-_=?.",
  spaces: " ",
};

const inputLength = document.getElementById("length");
const lengthValue = document.getElementById("length-value");
const checkboxes = {
  lowercase: document.getElementById("lowercase"),
  uppercase: document.getElementById("uppercase"),
  numbers: document.getElementById("numbers"),
  symbols: document.getElementById("symbols"),
  spaces: document.getElementById("include-spaces"),
};
const noDuplicates = document.getElementById("no-duplicates");
const optionsMessage = document.getElementById("options-message");
const generateButton = document.getElementById("generate-button");
const emptyResult = document.getElementById("empty-result");
const generationMessage = document.getElementById("generation-message");
const generatedResult = document.getElementById("generated-result");
const passwordOutput = document.getElementById("password-output");
const resultLength = document.getElementById("result-length");
const strengthLabel = document.getElementById("strength-label");
const strengthBadge = document.getElementById("strength-badge");
const strengthTrack = document.querySelector(".strength-track");
const strengthFill = document.getElementById("strength-fill");
const copyButton = document.getElementById("copy-button");
const togglePassword = document.getElementById("toggle-password");
const regenerateButton = document.getElementById("regenerate-button");
const copyStatus = document.getElementById("copy-status");

function getCharacterSets() {
  return Object.entries(CARACTERES)
    .filter(([key]) => checkboxes[key].checked)
    .map(([, characters]) => characters);
}

function getCharacterPool(characterSets) {
  return [...new Set(characterSets.join(""))];
}

function secureRandomIndex(maximum) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Este navegador não oferece geração aleatória segura.");
  }
  if (!Number.isInteger(maximum) || maximum < 1) {
    throw new Error("Não há caracteres disponíveis para gerar a senha.");
  }

  const range = 0x100000000;
  const limiteAceitavel = range - (range % maximum);
  const valor = new Uint32Array(1);

  do {
    globalThis.crypto.getRandomValues(valor);
  } while (valor[0] >= limiteAceitavel);

  return valor[0] % maximum;
}

function escolherCaracteres(pool, comprimento, semRepeticao) {
  if (!semRepeticao) {
    return Array.from({ length: comprimento }, () => pool[secureRandomIndex(pool.length)]);
  }

  const disponiveis = [...pool];
  const escolhidos = [];

  for (let indice = 0; indice < comprimento; indice += 1) {
    const indiceAleatorio = indice + secureRandomIndex(disponiveis.length - indice);
    [disponiveis[indice], disponiveis[indiceAleatorio]] = [
      disponiveis[indiceAleatorio],
      disponiveis[indice],
    ];
    escolhidos.push(disponiveis[indice]);
  }

  return escolhidos;
}

function embaralharSeguro(caracteres) {
  for (let indice = caracteres.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = secureRandomIndex(indice + 1);
    [caracteres[indice], caracteres[indiceAleatorio]] = [
      caracteres[indiceAleatorio],
      caracteres[indice],
    ];
  }
  return caracteres;
}

function contemTodosOsGrupos(senha, grupos) {
  return grupos.every((grupo) => [...senha].some((caractere) => grupo.includes(caractere)));
}

function gerarSenha(comprimento, grupos, pool, semRepeticao) {
  for (let tentativa = 0; tentativa < 500; tentativa += 1) {
    const caracteres = escolherCaracteres(pool, comprimento, semRepeticao);
    if (contemTodosOsGrupos(caracteres.join(""), grupos)) {
      return embaralharSeguro(caracteres).join("");
    }
  }

  throw new Error("Não foi possível gerar uma senha com essas opções. Tente novamente.");
}

function contarPermutacoes(total, quantidade) {
  if (total < quantidade) return 0;
  let resultado = 1;
  for (let indice = 0; indice < quantidade; indice += 1) {
    resultado *= total - indice;
  }
  return resultado;
}

function estimarBits(grupos, poolSize, comprimento, semRepeticao) {
  let combinacoesValidas = 0;
  const subconjuntos = 2 ** grupos.length;

  // Inclusão-exclusão conta as senhas que contêm todos os grupos selecionados.
  for (let mascara = 0; mascara < subconjuntos; mascara += 1) {
    let caracteresExcluidos = 0;
    let quantidadeExcluida = 0;

    grupos.forEach((grupo, indice) => {
      if (mascara & (1 << indice)) {
        caracteresExcluidos += grupo.length;
        quantidadeExcluida += 1;
      }
    });

    const caracteresRestantes = poolSize - caracteresExcluidos;
    const combinacoes = semRepeticao
      ? contarPermutacoes(caracteresRestantes, comprimento)
      : caracteresRestantes ** comprimento;
    combinacoesValidas += quantidadeExcluida % 2 ? -combinacoes : combinacoes;
  }

  return combinacoesValidas > 0 ? Math.log2(combinacoesValidas) : 0;
}

function faixaDeForca(bits) {
  if (bits >= 90) return { nivel: "muito-forte", nome: "Muito forte", porcentagem: 100 };
  if (bits >= 70) return { nivel: "forte", nome: "Forte", porcentagem: 78 };
  if (bits >= 50) return { nivel: "boa", nome: "Boa", porcentagem: 56 };
  return { nivel: "moderada", nome: "Moderada", porcentagem: 34 };
}

function limparResultado(mensagem = "") {
  passwordOutput.value = "";
  passwordOutput.type = "password";
  resultLength.textContent = "";
  copyButton.disabled = true;
  togglePassword.disabled = true;
  togglePassword.textContent = "Mostrar";
  togglePassword.setAttribute("aria-pressed", "false");
  regenerateButton.disabled = true;
  generatedResult.hidden = true;
  emptyResult.hidden = false;
  strengthBadge.hidden = true;
  strengthLabel.textContent = "—";
  strengthTrack.dataset.strength = "";
  strengthTrack.setAttribute("aria-valuenow", "0");
  strengthFill.style.width = "0";
  copyStatus.textContent = "";
  generationMessage.textContent = mensagem;
  generationMessage.hidden = !mensagem;
}

function atualizarOpcoes() {
  const comprimento = Number(inputLength.value);
  const grupos = getCharacterSets();
  const pool = getCharacterPool(grupos);
  let mensagem = "";

  lengthValue.textContent = `${comprimento} ${comprimento === 1 ? "caractere" : "caracteres"}`;

  if (grupos.length === 0) {
    mensagem = "Selecione pelo menos um tipo de caractere.";
  } else if (noDuplicates.checked && comprimento > pool.length) {
    mensagem = `Com essa opção, o máximo é ${pool.length} caracteres sem repetição.`;
  }

  optionsMessage.textContent = mensagem;
  optionsMessage.hidden = !mensagem;
  generateButton.disabled = Boolean(mensagem);
  limparResultado();
}

function exibirSenha(senha, grupos, poolSize) {
  const bits = estimarBits(grupos, poolSize, senha.length, noDuplicates.checked);
  const forca = faixaDeForca(bits);

  passwordOutput.value = senha;
  passwordOutput.type = "password";
  resultLength.textContent = `${senha.length} caracteres`;
  strengthLabel.textContent = forca.nome;
  strengthBadge.textContent = forca.nome;
  strengthBadge.dataset.strength = forca.nivel;
  strengthBadge.hidden = false;
  strengthTrack.dataset.strength = forca.nivel;
  strengthTrack.setAttribute("aria-valuenow", String(forca.porcentagem));
  strengthFill.style.width = `${forca.porcentagem}%`;

  emptyResult.hidden = true;
  generatedResult.hidden = false;
  copyButton.disabled = false;
  togglePassword.disabled = false;
  regenerateButton.disabled = false;
  generationMessage.textContent = "";
  generationMessage.hidden = true;
  copyStatus.textContent = "Senha gerada neste navegador.";
}

function gerarEExibirSenha() {
  const comprimento = Number(inputLength.value);
  const grupos = getCharacterSets();
  const pool = getCharacterPool(grupos);

  try {
    const senha = gerarSenha(comprimento, grupos, pool, noDuplicates.checked);
    exibirSenha(senha, grupos, pool.length);
  } catch (erro) {
    limparResultado(erro.message || "Não foi possível gerar a senha.");
  }
}

async function copiarSenha() {
  if (!passwordOutput.value) return;

  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(passwordOutput.value);
      copyStatus.textContent = "Senha copiada. Guarde-a em um local seguro.";
      return;
    }

    passwordOutput.type = "text";
    togglePassword.textContent = "Ocultar";
    togglePassword.setAttribute("aria-pressed", "true");
    passwordOutput.focus();
    passwordOutput.select();
    const copiou = document.execCommand("copy");
    if (copiou) {
      passwordOutput.type = "password";
      togglePassword.textContent = "Mostrar";
      togglePassword.setAttribute("aria-pressed", "false");
      passwordOutput.setSelectionRange(0, 0);
      copyStatus.textContent = "Senha copiada. Guarde-a em um local seguro.";
    } else {
      copyStatus.textContent = "A senha está selecionada. Copie pelo menu do navegador.";
    }
  } catch {
    passwordOutput.type = "text";
    togglePassword.textContent = "Ocultar";
    togglePassword.setAttribute("aria-pressed", "true");
    passwordOutput.focus();
    passwordOutput.select();
    copyStatus.textContent = "A senha está selecionada. Copie pelo menu do navegador.";
  }
}

function alternarVisibilidade() {
  const mostrar = passwordOutput.type === "password";
  passwordOutput.type = mostrar ? "text" : "password";
  togglePassword.textContent = mostrar ? "Ocultar" : "Mostrar";
  togglePassword.setAttribute("aria-pressed", String(mostrar));
}

[
  inputLength,
  ...Object.values(checkboxes),
  noDuplicates,
].forEach((controle) => {
  controle.addEventListener("input", atualizarOpcoes);
  controle.addEventListener("change", atualizarOpcoes);
});

generateButton.addEventListener("click", gerarEExibirSenha);
regenerateButton.addEventListener("click", gerarEExibirSenha);
copyButton.addEventListener("click", copiarSenha);
togglePassword.addEventListener("click", alternarVisibilidade);

atualizarOpcoes();
