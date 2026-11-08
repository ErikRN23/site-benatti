
// Configure com os dados do seu projeto Supabase.
const SUPABASE_URL = "https://xkdgnltpsreiixyfqyex.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JxhJZ-L4tjIa2otmi2B1dQ_53fCxamM";

const LABELS = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"];
const notas = { comida: 0, servico: 0 };
const $ = (id) => document.getElementById(id);

function mostrarMensagem(texto, erro = false) {
  const elemento = $("msg");
  elemento.textContent = texto;
  elemento.className = "msg" + (erro ? " err" : "");
}

// Cria as estrelas de avaliação
document.querySelectorAll(".stars").forEach((grupo) => {
  const chave = grupo.dataset.k;

  for (let nota = 1; nota <= 5; nota++) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = "★";
    botao.dataset.n = nota;
    botao.setAttribute("role", "radio");
    botao.setAttribute("aria-checked", "false");
    botao.setAttribute(
      "aria-label",
      `${nota} de 5 – ${LABELS[nota - 1]}`
    );

    botao.addEventListener("click", () => definirNota(chave, nota));

    grupo.appendChild(botao);
  }
});

// Define a nota selecionada
function definirNota(chave, valor) {
  notas[chave] = valor;

  document
    .querySelectorAll(`.stars[data-k="${chave}"] button`)
    .forEach((botao) => {
      const selecionada = Number(botao.dataset.n) <= valor;

      botao.classList.toggle("on", selecionada);

      botao.setAttribute(
        "aria-checked",
        Number(botao.dataset.n) === valor ? "true" : "false"
      );
    });

  $(`lbl-${chave}`).textContent =
    `${valor} de 5 – ${LABELS[valor - 1]}`;
}

// Envia a avaliação para o Supabase
$("enviar").addEventListener("click", async () => {
  if (!notas.comida || !notas.servico) {
    mostrarMensagem(
      "Escolha uma nota de 1 a 5 para a comida e para o serviço.",
      true
    );
    return;
  }

  if (
    SUPABASE_URL.includes("SEU-PROJETO") ||
    SUPABASE_ANON_KEY === "SUA_CHAVE_ANON"
  ) {
    mostrarMensagem(
      "Configure a URL e a chave anon do Supabase no arquivo js/script.js.",
      true
    );
    return;
  }

  const botao = $("enviar");

  botao.disabled = true;
  mostrarMensagem("Enviando…");

  const avaliacao = {
    nome: $("nome").value.trim() || null,
    evento: $("evento").value.trim() || null,
    nota_comida: notas.comida,
    nota_servico: notas.servico,
    comentario_comida: $("com-comida").value.trim() || null,
    comentario_servico: $("com-servico").value.trim() || null,
    sugestao: $("sug").value.trim() || null
  };

  try {
    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/avaliacoes`,
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(avaliacao)
      }
    );

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(detalhe || "Falha ao salvar avaliação.");
    }

    $("form-area").hidden = true;
    $("thanks").hidden = false;

    window.scrollTo(0, 0);

  } catch (erro) {
    console.error("Erro ao enviar avaliação:", erro);

    mostrarMensagem(
      "Não foi possível enviar. Confira a configuração do Supabase e tente novamente.",
      true
    );

  } finally {
    botao.disabled = false;
  }
});

// Permite enviar outra avaliação
$("outra").addEventListener("click", () => {
  ["com-comida", "com-servico", "sug", "nome", "evento"].forEach((id) => {
    $(id).value = "";
  });

  notas.comida = 0;
  notas.servico = 0;

  ["comida", "servico"].forEach((chave) => {
    document
      .querySelectorAll(`.stars[data-k="${chave}"] button`)
      .forEach((botao) => {
        botao.classList.remove("on");
        botao.setAttribute("aria-checked", "false");
      });

    $(`lbl-${chave}`).textContent = "";
  });

  mostrarMensagem("");

  $("thanks").hidden = true;
  $("form-area").hidden = false;
});
