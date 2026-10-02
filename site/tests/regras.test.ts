import { describe, expect, it } from 'vitest';
import {
    calcularTaxa,
    calcularTaxaAgregada,
    calcularTendencia,
    MINIMO_DECISOES,
    podeMostrarTaxa,
} from '../src/lib/regras';

describe('MINIMO_DECISOES', () => {
    it('é 30, conforme a regra 2 do desafio', () => {
        expect(MINIMO_DECISOES).toBe(30);
    });
});

describe('podeMostrarTaxa', () => {
    it('rejeita 0 decisões', () => {
        expect(podeMostrarTaxa(0)).toBe(false);
    });

    it('rejeita 29 decisões (base pequena)', () => {
        expect(podeMostrarTaxa(29)).toBe(false);
    });

    it('aceita exatamente 30 decisões', () => {
        expect(podeMostrarTaxa(30)).toBe(true);
    });

    it('aceita 100 decisões', () => {
        expect(podeMostrarTaxa(100)).toBe(true);
    });
});

describe('calcularTaxa', () => {
    it('retorna null para base pequena', () => {
        expect(calcularTaxa(10, 29)).toBeNull();
    });

    it('retorna null para total zero', () => {
        expect(calcularTaxa(0, 0)).toBeNull();
    });

    it('calcula taxa com base suficiente', () => {
        expect(calcularTaxa(15, 30)).toBe(0.5);
    });

    it('calcula taxa com arredondamento', () => {
        const taxa = calcularTaxa(38, 100);
        expect(taxa).toBeCloseTo(0.38);
    });
});

describe('calcularTaxaAgregada', () => {
    it('soma favoráveis e totais das janelas', () => {
        const taxa = calcularTaxaAgregada([
            { favoraveis: 10, total: 50 },
            { favoraveis: 20, total: 50 },
        ]);
        expect(taxa).toBeCloseTo(0.3);
    });

    it('não é a média das taxas anuais', () => {
        // Se fosse média: (10/10 + 0/100) / 2 = 0.5
        // Agregada: (10 + 0) / (10 + 100) = 0.0909...
        const taxa = calcularTaxaAgregada([
            { favoraveis: 10, total: 10 },
            { favoraveis: 0, total: 100 },
        ]);
        expect(taxa).toBeCloseTo(10 / 110);
    });

    it('retorna null quando o total agregado é pequeno', () => {
        expect(
            calcularTaxaAgregada([
                { favoraveis: 5, total: 10 },
                { favoraveis: 5, total: 15 },
            ]),
        ).toBeNull();
    });
});

describe('calcularTendencia', () => {
    const janelaGrande = (favoraveis: number, total: number) => ({
        favoraveis,
        total,
    });

    it('calcula diferença em pontos percentuais', () => {
        const tendencia = calcularTendencia(
            [janelaGrande(50, 100)],
            [janelaGrande(40, 100)],
        );
        expect(tendencia).toBeCloseTo(10); // 50% - 40% = 10 p.p.
    });

    it('retorna null quando a janela recente é pequena', () => {
        const tendencia = calcularTendencia(
            [janelaGrande(5, 10)],
            [janelaGrande(40, 100)],
        );
        expect(tendencia).toBeNull();
    });

    it('retorna null quando a janela anterior é pequena', () => {
        const tendencia = calcularTendencia(
            [janelaGrande(50, 100)],
            [janelaGrande(5, 10)],
        );
        expect(tendencia).toBeNull();
    });

    it('calcula tendência negativa', () => {
        const tendencia = calcularTendencia(
            [janelaGrande(30, 100)],
            [janelaGrande(50, 100)],
        );
        expect(tendencia).toBeCloseTo(-20);
    });
});
