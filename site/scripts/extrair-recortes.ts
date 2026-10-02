// ============================================
// Extrai recortes específicos do observatorio.json
// para os artigos do Site usarem.
// ============================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Observatorio, Recortes } from './tipos.js';

// ============================================
// Caminhos
// ============================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const origem = path.join(
    __dirname,
    '..',
    '..',
    'observatorio',
    'dados',
    'observatorio.json',
);
const destino = path.join(__dirname, '..', 'src', 'data', 'recortes.json');

// ============================================
// Constantes
// ============================================
const MINIMO_DECISOES = 30;

// ============================================
// Tipos internos
// ============================================
interface Agregado {
    total: number;
    favoraveis: number;
    taxa: number | null;
    basePequena: boolean;
}

// ============================================
// Agrega uma lista de registros mensais
// ============================================
function agregar(registros: Observatorio['mensal']): Agregado {
    let total = 0;
    let favoraveis = 0;

    for (const r of registros) {
        total += r.total;
        favoraveis += r.favoraveis;
    }

    if (total < MINIMO_DECISOES) {
        return { total, favoraveis, taxa: null, basePequena: true };
    }

    return {
        total,
        favoraveis,
        taxa: favoraveis / total,
        basePequena: false,
    };
}

// ============================================
// Recorte por tribunal + classe + intervalo de anos
// ============================================
function recorte(
    mensal: Observatorio['mensal'],
    tribunal: string,
    classe: string,
    de: number,
    ate: number,
): Agregado {
    const filtrados = mensal.filter((r) => {
        if (r.tribunal !== tribunal) return false;
        if (r.classe !== classe) return false;
        const ano = Number(r.mes.slice(0, 4));
        return ano >= de && ano <= ate;
    });

    return agregar(filtrados);
}

// ============================================
// Lê o observatorio.json
// ============================================
if (!fs.existsSync(origem)) {
    console.error(`Arquivo não encontrado: ${origem}`);
    process.exit(1);
}

const bruto = fs.readFileSync(origem, 'utf-8');
const dados = JSON.parse(bruto) as Observatorio;

// ============================================
// Valida o que veio
// ============================================
if (!dados.mensal || !dados.universo) {
    console.error(
        'observatorio.json não tem os campos esperados: mensal, universo.',
    );
    process.exit(1);
}

const { mensal, universo } = dados;

// ============================================
// Calcula as janelas de tempo
// ============================================
const ANO_FIM = universo.ate - 1; // Último ano fechado
const ANO_INICIO = ANO_FIM - 2; // 3 últimos anos fechados
const ANO_INICIO_ANTERIOR = ANO_INICIO - 3;
const ANO_FIM_ANTERIOR = ANO_INICIO - 1;

// ============================================
// Monta o resultado
// ============================================
const resultado: Recortes = {
    gerado_em: new Date().toISOString(),
    criterio: dados.criterio,
    universo,
    recortes: {
        hc_stj_10_anos: recorte(mensal, 'STJ', 'HC', ANO_FIM - 9, ANO_FIM),
        hc_stj_recente: recorte(mensal, 'STJ', 'HC', ANO_INICIO, ANO_FIM),
        hc_stj_anterior: recorte(
            mensal,
            'STJ',
            'HC',
            ANO_INICIO_ANTERIOR,
            ANO_FIM_ANTERIOR,
        ),
        resp_stj_10_anos: recorte(mensal, 'STJ', 'REsp', ANO_FIM - 9, ANO_FIM),
        resp_stj_recente: recorte(mensal, 'STJ', 'REsp', ANO_INICIO, ANO_FIM),
        resp_stj_anterior: recorte(
            mensal,
            'STJ',
            'REsp',
            ANO_INICIO_ANTERIOR,
            ANO_FIM_ANTERIOR,
        ),
    },
    janelas: {
        recente: `${ANO_INICIO}-${ANO_FIM}`,
        anterior: `${ANO_INICIO_ANTERIOR}-${ANO_FIM_ANTERIOR}`,
    },
};

// ============================================
// Escreve
// ============================================
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(resultado, null, 4), 'utf-8');

console.log(`recortes.json gerado em ${destino}`);
console.log(
    `  HC STJ (${ANO_FIM - 9}-${ANO_FIM}):`,
    resultado.recortes.hc_stj_10_anos,
);
console.log(
    `  REsp STJ (${ANO_FIM - 9}-${ANO_FIM}):`,
    resultado.recortes.resp_stj_10_anos,
);
console.log(
    `  Janelas de tendência: ${resultado.janelas.anterior} vs. ${resultado.janelas.recente}`,
);
