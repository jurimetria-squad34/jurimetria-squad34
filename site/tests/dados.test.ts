import { describe, expect, it } from 'vitest';
import planos from '../src/config/planos.json';
import exemplo from '../src/data/exemplo.json';
import universo from '../src/data/universo.json';

describe('planos.json', () => {
    it('tem dois planos', () => {
        expect(planos.planos).toHaveLength(2);
    });

    it('cada plano tem os campos obrigatórios', () => {
        for (const plano of planos.planos) {
            expect(plano).toHaveProperty('id');
            expect(plano).toHaveProperty('nome');
            expect(plano).toHaveProperty('preco');
            expect(plano).toHaveProperty('periodo');
            expect(plano).toHaveProperty('descricao');
            expect(plano).toHaveProperty('destaque');
            expect(plano.recursos.length).toBeGreaterThan(0);
        }
    });

    it('exatamente um plano está em destaque', () => {
        const destaques = planos.planos.filter((p) => p.destaque);
        expect(destaques).toHaveLength(1);
    });

    it('tem um FAQ com pelo menos 4 perguntas', () => {
        expect(planos.faq.length).toBeGreaterThanOrEqual(4);
    });

    it('cada pergunta do FAQ tem pergunta e resposta', () => {
        for (const item of planos.faq) {
            expect(item.pergunta.length).toBeGreaterThan(0);
            expect(item.resposta.length).toBeGreaterThan(0);
        }
    });
});

describe('universo.json', () => {
    it('tem gerado_em, criterio e universo', () => {
        expect(universo).toHaveProperty('gerado_em');
        expect(universo).toHaveProperty('criterio');
        expect(universo).toHaveProperty('universo');
    });

    it('o critério explica o que conta como favorável', () => {
        expect(universo.criterio.toLowerCase()).toContain('favorável');
    });

    it('o universo tem tribunais, decisoes, de e ate', () => {
        expect(universo.universo).toHaveProperty('tribunais');
        expect(universo.universo).toHaveProperty('decisoes');
        expect(universo.universo).toHaveProperty('de');
        expect(universo.universo).toHaveProperty('ate');
    });

    it('os tribunais incluem STJ e STF', () => {
        expect(universo.universo.tribunais).toContain('STJ');
        expect(universo.universo.tribunais).toContain('STF');
    });

    it('o total de decisões é positivo', () => {
        expect(universo.universo.decisoes).toBeGreaterThan(0);
    });
});

describe('exemplo.json', () => {
    it('tem as chaves esperadas', () => {
        expect(exemplo).toHaveProperty('caso');
        expect(exemplo).toHaveProperty('plano');
        expect(exemplo).toHaveProperty('favoravel');
        expect(exemplo).toHaveProperty('contrario');
        expect(exemplo).toHaveProperty('distincao');
        expect(exemplo).toHaveProperty('aviso');
    });

    it('a decisão favorável tem link oficial do tribunal', () => {
        expect(exemplo.favoravel.link).toMatch(/^https:\/\//);
    });

    it('a decisão contrária tem link oficial do tribunal', () => {
        expect(exemplo.contrario.link).toMatch(/^https:\/\//);
    });

    it('as decisões têm número, classe, relator e data', () => {
        for (const decisao of [
            exemplo.favoravel,
            exemplo.contrario,
            exemplo.distincao,
        ]) {
            expect(decisao.numero.length).toBeGreaterThan(0);
            expect(decisao.classe.length).toBeGreaterThan(0);
            expect(decisao.relator.length).toBeGreaterThan(0);
            expect(decisao.data.length).toBeGreaterThan(0);
        }
    });
});
