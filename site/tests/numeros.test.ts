import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const arquivos = [
    'src/config/planos.json',
    'src/pages/planos.astro',
    'src/pages/index.astro',
    'src/pages/como-funciona.astro',
];

describe('números da base', () => {
    it.each(arquivos)('%s não tem número arredondado fixo', (arquivo) => {
        const texto = readFileSync(arquivo, 'utf-8');
        expect(texto).not.toMatch(/\d+\s+milhões/);
        expect(texto).not.toMatch(/em milhões de decisões/);
    });
});
