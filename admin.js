
const SUPABASE_URL = "https://xkdgnltpsreiixyfqyex.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JxhJZ-L4tjIa2otmi2B1dQ_53fCxamM";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const $ = (id) => document.getElementById(id);

const loginArea = $("login-area");
const dashboard = $("dashboard");
const loginForm = $("login-form");

function mensagem(texto, elemento = "login-msg") {
    $(elemento).textContent = texto;
}

// Verifica se o usuário é administrador
async function verificarAdmin(user) {
    const { data, error } = await db
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        await db.auth.signOut();
        throw new Error("Você não possui permissão de administrador.");
    }

    loginArea.hidden = true;
    dashboard.hidden = false;

    await carregarAvaliacoes();
}

// Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = $("login-button");

    button.disabled = true;
    mensagem("Verificando acesso...");

    try {
        const { data, error } = await db.auth.signInWithPassword({
            email: $("email").value.trim(),
            password: $("password").value
        });

        if (error) throw error;

        await verificarAdmin(data.user);

    } catch (error) {
        console.error("Erro no login:", error);

        mensagem(error.message || "Não foi possível entrar.");

    } finally {
        button.disabled = false;
    }
});

// Carrega as avaliações
async function carregarAvaliacoes() {
    mensagem("Carregando avaliações...", "loading");

    const { data, error } = await db
        .from("avaliacoes")
        .select(`
            id,
            criado_em,
            nome,
            evento,
            nota_comida,
            nota_servico,
            comentario_comida,
            comentario_servico,
            sugestao
        `)
        .order("criado_em", { ascending: false })
        .limit(200);

    if (error) {
        console.error("Erro ao carregar avaliações:", error);
        mensagem("Não foi possível carregar as avaliações.", "loading");
        return;
    }

    renderizarDashboard(data || []);
}

// Monta os indicadores e os cartões
function renderizarDashboard(avaliacoes) {
    const total = avaliacoes.length;

    const media = (campo) => {
        if (!total) return "0.0";

        const soma = avaliacoes.reduce(
            (acumulado, item) => acumulado + item[campo],
            0
        );

        return (soma / total).toFixed(1);
    };

    $("total").textContent = total;
    $("media-comida").textContent = media("nota_comida");
    $("media-servico").textContent = media("nota_servico");

    const lista = $("evaluations-list");
    lista.replaceChildren();

    if (!total) {
        const vazio = document.createElement("p");
        vazio.textContent = "Nenhuma avaliação recebida ainda.";
        lista.appendChild(vazio);
    }

    avaliacoes.forEach((item) => {
        const card = document.createElement("article");
        card.className = "evaluation";

        const titulo = document.createElement("h3");
        titulo.textContent = item.nome || "Cliente sem identificação";

        const data = document.createElement("p");
        data.className = "date";
        data.textContent = item.criado_em
            ? new Date(item.criado_em).toLocaleString("pt-BR")
            : "";

        const evento = document.createElement("p");
        evento.textContent = `Evento: ${item.evento || "Não informado"}`;

        const comida = document.createElement("p");
        comida.className = "rating";
        comida.textContent = `Comida: ${"★".repeat(item.nota_comida)} (${item.nota_comida}/5)`;

        const servico = document.createElement("p");
        servico.className = "rating";
        servico.textContent = `Serviço: ${"★".repeat(item.nota_servico)} (${item.nota_servico}/5)`;

        card.append(
            titulo,
            data,
            evento,
            comida,
            servico
        );

        adicionarTexto(card, "Comentário sobre a comida", item.comentario_comida);
        adicionarTexto(card, "Comentário sobre o serviço", item.comentario_servico);
        adicionarTexto(card, "Sugestão", item.sugestao);

        lista.appendChild(card);
    });

    mensagem("", "loading");
}

// Adiciona textos sem interpretar conteúdo como HTML
function adicionarTexto(card, titulo, valor) {
    if (!valor) return;

    const paragrafo = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${titulo}: `;
    paragrafo.append(strong, document.createTextNode(valor));

    card.appendChild(paragrafo);
}

// Atualizar avaliações
$("refresh-button").addEventListener("click", carregarAvaliacoes);

// Sair da conta
$("logout-button").addEventListener("click", async () => {
    await db.auth.signOut();

    dashboard.hidden = true;
    loginArea.hidden = false;

    loginForm.reset();
    mensagem("Você saiu da sua conta.");
});

// Recuperar sessão ao recarregar a página
async function iniciar() {
    const { data, error } = await db.auth.getSession();

    if (error) {
        mensagem("Não foi possível verificar sua sessão.");
        return;
    }

    if (data.session) {
        try {
            await verificarAdmin(data.session.user);
        } catch (error) {
            console.error("Erro ao verificar administrador:", error);
            loginArea.hidden = false;
            dashboard.hidden = true;
            mensagem(error.message);
        }
    }
}

iniciar();
