// ============================================
// Extrai os relatores mais relevantes de um recorte
// do observatorio.json para os gráficos do Site.
// ============================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Observatorio, Relatores } from './tipos.js';

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
const destino = path.join(__dirname, '..', 'src', 'data', 'relatores.json');

// ============================================
// Configuração do recorte
// ============================================
const RECORTE = {
    tribunal: 'STJ',
    classe: 'HC',
    materia: 'penal',
    anos: 5, // últimos 5 anos fechados
    minimoDecisoes: 30,
    topRelatores: 5,
};

// ============================================
// Lê o observatorio.json
// ============================================
if (!fs.existsSync(origem)) {
    console.error(`Arquivo não encontrado: ${origem}`);
    process.exit(1);
}

const bruto = fs.readFileSync(origem, 'utf-8');
const dados = JSON.parse(bruto) as Observatorio;

if (!dados.relatores || !dados.universo) {
    console.error(
        'observatorio.json não tem os campos esperados: relatores, universo.',
    );
    process.exit(1);
}

// ============================================
// Calcula os anos fechados
// ============================================
const ANO_FIM = dados.universo.ate - 1;
const ANO_INICIO = ANO_FIM - RECORTE.anos + 1;

// ============================================
// Filtra os relatores do recorte
// ============================================
const filtrados = dados.relatores.filter((r) => {
    if (r.tribunal !== RECORTE.tribunal) return false;
    if (r.classe !== RECORTE.classe) return false;
    if (RECORTE.materia && r.materia !== RECORTE.materia) return false;
    return r.ano >= ANO_INICIO && r.ano <= ANO_FIM;
});

// ============================================
// Agrupa por relator
// ============================================
const porRelator = new Map<
    string,
    { total: number; favoraveis: number; anos: Set<number> }
>();

for (const r of filtrados) {
    const atual = porRelator.get(r.relator) ?? {
        total: 0,
        favoraveis: 0,
        anos: new Set<number>(),
    };
    atual.total += r.total;
    atual.favoraveis += r.favoraveis;
    atual.anos.add(r.ano);
    porRelator.set(r.relator, atual);
}

// ============================================
// Monta a lista de relatores com taxa
// ============================================
const lista = Array.from(porRelator.entries())
    .map(([nome, dados]) => {
        const basePequena = dados.total < RECORTE.minimoDecisoes;
        return {
            nome,
            total: dados.total,
            favoraveis: dados.favoraveis,
            taxa: basePequena ? null : dados.favoraveis / dados.total,
            basePequena,
            anos: Array.from(dados.anos).sort(),
        };
    })
    .filter((r) => !r.basePequena)
    .sort((a, b) => b.total - a.total)
    .slice(0, RECORTE.topRelatores);

// ============================================
// Monta o resultado
// ============================================
const resultado: Relatores = {
    gerado_em: new Date().toISOString(),
    criterio: dados.criterio,
    recorte: {
        tribunal: RECORTE.tribunal,
        classe: RECORTE.classe,
        materia: RECORTE.materia,
        periodo: `${ANO_INICIO}-${ANO_FIM}`,
        minimoDecisoes: RECORTE.minimoDecisoes,
    },
    relatores: lista,
};

// ============================================
// Escreve
// ============================================
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(resultado, null, 4), 'utf-8');

console.log(`relatores.json gerado em ${destino}`);
console.log(
    `  Recorte: ${RECORTE.tribunal} · ${RECORTE.classe} · ${RECORTE.materia} · ${ANO_INICIO}-${ANO_FIM}`,
);
console.log(`  Total de relatores no recorte: ${porRelator.size}`);
console.log(
    `  Relatores selecionados (top ${RECORTE.topRelatores} por volume):`,
);
for (const r of lista) {
    console.log(
        `    ${r.nome}: ${r.total} decisões, taxa ${(r.taxa! * 100).toFixed(1)}%`,
    );
}
