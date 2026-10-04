import { describe, expect, it } from 'vitest';
import relatores from '../src/data/relatores.json';

describe('relatores.json', () => {
    it('tem gerado_em, criterio, recorte e relatores', () => {
        expect(relatores).toHaveProperty('gerado_em');
        expect(relatores).toHaveProperty('criterio');
        expect(relatores).toHaveProperty('recorte');
        expect(relatores).toHaveProperty('relatores');
    });

    it('o recorte tem tribunal, classe, materia e periodo', () => {
        expect(relatores.recorte.tribunal).toBe('STJ');
        expect(relatores.recorte.classe).toBe('HC');
        expect(relatores.recorte.materia).toBe('penal');
        expect(relatores.recorte.periodo).toMatch(/^\d{4}-\d{4}$/);
    });

    it('tem exatamente 5 relatores', () => {
        expect(relatores.relatores).toHaveLength(5);
    });

    it('cada relator tem nome, total, favoraveis, taxa e basePequena', () => {
        for (const r of relatores.relatores) {
            expect(r.nome.length).toBeGreaterThan(0);
            expect(r.total).toBeGreaterThan(0);
            expect(r.favoraveis).toBeGreaterThanOrEqual(0);
            expect(r.basePequena).toBe(false);
            expect(r.taxa).not.toBeNull();
        }
    });

    it('nenhum relator tem menos de 30 decisões', () => {
        for (const r of relatores.relatores) {
            expect(r.total).toBeGreaterThanOrEqual(30);
        }
    });

    it('cada relator tem taxa entre 0 e 1', () => {
        for (const r of relatores.relatores) {
            expect(r.taxa).toBeGreaterThanOrEqual(0);
            expect(r.taxa).toBeLessThanOrEqual(1);
        }
    });
});
