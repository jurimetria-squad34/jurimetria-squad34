import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// ============================================
// Verifica que o Site cumpre as regras do escopo
// Referência: DESAFIO-SQUAD34.md, site/ESCOPO.md
// ============================================

const RAIZ = path.join(__dirname, '..');
const PAGINAS = path.join(RAIZ, 'src', 'pages');

function normalizar(texto: string): string {
    return texto.toLowerCase().replace(/\s+/g, ' ').trim();
}

function lerPaginas(): Array<{ nome: string; conteudo: string }> {
    return fs
        .readdirSync(PAGINAS)
        .filter((f) => f.endsWith('.astro') && f !== 'style-guide.astro')
        .map((f) => ({
            nome: f,
            conteudo: normalizar(
                fs.readFileSync(path.join(PAGINAS, f), 'utf-8'),
            ),
        }));
}

/**
 * Verifica se uma frase aparece no texto de forma afirmativa,
 * ou seja, sem "não" logo antes.
 */
function apareceAfirmada(texto: string, frase: string): boolean {
    let index = texto.indexOf(frase);
    while (index >= 0) {
        // Olha os 20 caracteres antes da frase
        const antes = texto.slice(Math.max(0, index - 20), index);
        // Se tiver "não" ou "sem" antes, é negação
        const negado = /\b(não|sem)\b/.test(antes);
        if (!negado) return true;
        // Procura a próxima ocorrência
        index = texto.indexOf(frase, index + 1);
    }
    return false;
}

describe('regras do escopo do Site', () => {
    const paginas = lerPaginas();

    it('nenhuma página promete gerar peça ou petição', () => {
        const proibidas = [
            'gera petição',
            'geramos petição',
            'gerar petição',
            'gera peça',
            'gerar peça',
        ];
        for (const pagina of paginas) {
            for (const frase of proibidas) {
                expect(
                    apareceAfirmada(pagina.conteudo, frase),
                    `página ${pagina.nome}: "${frase}"`,
                ).toBe(false);
            }
        }
    });

    it('nenhuma página promete prever resultado', () => {
        const proibidas = [
            'prevê o resultado',
            'prevemos o resultado',
            'prever o resultado',
            'prevê resultado',
        ];
        for (const pagina of paginas) {
            for (const frase of proibidas) {
                expect(
                    apareceAfirmada(pagina.conteudo, frase),
                    `página ${pagina.nome}: "${frase}"`,
                ).toBe(false);
            }
        }
    });

    it('nenhuma página promete buscar por nome de parte', () => {
        const proibidas = [
            'buscamos por nome de parte',
            'buscar por nome de parte',
            'busca por nome de parte',
            'pesquisa por nome de parte',
        ];
        for (const pagina of paginas) {
            for (const frase of proibidas) {
                expect(
                    apareceAfirmada(pagina.conteudo, frase),
                    `página ${pagina.nome}: "${frase}"`,
                ).toBe(false);
            }
        }
    });

    it('nenhuma página diz que raspa site de tribunal', () => {
        const proibidas = [
            'raspagem de site de tribunal',
            'raspamos o site do tribunal',
            'raspagem do site do stj',
            'raspagem do site do stf',
            'scraping do site do tribunal',
        ];
        for (const pagina of paginas) {
            for (const frase of proibidas) {
                expect(
                    apareceAfirmada(pagina.conteudo, frase),
                    `página ${pagina.nome}: "${frase}"`,
                ).toBe(false);
            }
        }
    });

    it('todas as páginas têm title e description no Layout', () => {
        for (const pagina of paginas) {
            expect(pagina.conteudo, `página ${pagina.nome}`).toMatch(/title=/);
            expect(pagina.conteudo, `página ${pagina.nome}`).toMatch(
                /description=/,
            );
        }
    });

    it('a página de Termos informa que o produto não busca por nome de parte', () => {
        const termos = paginas.find((p) => p.nome === 'termos.astro');
        expect(termos).toBeDefined();
        expect(termos!.conteudo).toContain(
            'não realiza busca por nome de parte',
        );
    });
});
