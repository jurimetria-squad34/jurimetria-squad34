import { describe, expect, it } from 'vitest';
import recortes from '../src/data/recortes.json';

describe('recortes.json', () => {
    it('tem gerado_em, criterio, universo e recortes', () => {
        expect(recortes).toHaveProperty('gerado_em');
        expect(recortes).toHaveProperty('criterio');
        expect(recortes).toHaveProperty('universo');
        expect(recortes).toHaveProperty('recortes');
        expect(recortes).toHaveProperty('janelas');
    });

    it('cada recorte tem total, favoraveis, taxa e basePequena', () => {
        for (const chave of Object.keys(recortes.recortes)) {
            const r =
                recortes.recortes[chave as keyof typeof recortes.recortes];
            expect(r).toHaveProperty('total');
            expect(r).toHaveProperty('favoraveis');
            expect(r).toHaveProperty('taxa');
            expect(r).toHaveProperty('basePequena');
        }
    });

    it('basePequena é true quando total < 30', () => {
        for (const r of Object.values(recortes.recortes)) {
            if (r.total < 30) {
                expect(r.basePequena).toBe(true);
                expect(r.taxa).toBeNull();
            } else {
                expect(r.basePequena).toBe(false);
                expect(r.taxa).not.toBeNull();
            }
        }
    });

    it('as janelas de tendência estão no formato AAAA-AAAA', () => {
        expect(recortes.janelas.recente).toMatch(/^\d{4}-\d{4}$/);
        expect(recortes.janelas.anterior).toMatch(/^\d{4}-\d{4}$/);
    });
});
