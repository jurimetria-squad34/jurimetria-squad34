import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Observatorio, Universo } from './tipos.js';

// ============================================
// Caminhos
// ============================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const origem = path.join(__dirname, '..', '..', 'observatorio', 'dados', 'observatorio.json');
const destino = path.join(__dirname, '..', 'src', 'data', 'universo.json');

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
if (!dados.gerado_em || !dados.criterio || !dados.universo) {
    console.error('observatorio.json não tem os campos esperados: gerado_em, criterio, universo.');
    process.exit(1);
}

const { tribunais, decisoes, de, ate } = dados.universo;

if (!Array.isArray(tribunais) || tribunais.length === 0) {
    console.error('universo.tribunais está vazio ou não é array.');
    process.exit(1);
}

if (typeof decisoes !== 'number' || decisoes <= 0) {
    console.error('universo.decisoes não é um número válido.');
    process.exit(1);
}

if (typeof de !== 'number' || typeof ate !== 'number') {
    console.error('universo.de e universo.ate precisam ser números.');
    process.exit(1);
}

// ============================================
// Monta o universo.json
// ============================================
const universo: Universo = {
    gerado_em: dados.gerado_em,
    criterio: dados.criterio,
    universo: {
        tribunais,
        decisoes,
        de,
        ate,
    },
};

// ============================================
// Escreve
// ============================================
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(universo, null, 4), 'utf-8');

console.log(`universo.json gerado em ${destino}`);
console.log(`  Decisões: ${decisoes.toLocaleString('pt-BR')}`);
console.log(`  Tribunais: ${tribunais.join(', ')}`);
console.log(`  Período: ${de} a ${ate}`);
