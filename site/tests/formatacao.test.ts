import { describe, expect, it } from 'vitest';
import {
    formatarData,
    formatarNumero,
    listarEmPortugues,
} from '../src/lib/formatacao';

describe('formatarNumero', () => {
    it('formata número grande com pontos', () => {
        expect(formatarNumero(11957116)).toBe('11.957.116');
    });

    it('formata número com milhar', () => {
        expect(formatarNumero(1000)).toBe('1.000');
    });

    it('formata número pequeno sem separador', () => {
        expect(formatarNumero(42)).toBe('42');
    });

    it('formata zero', () => {
        expect(formatarNumero(0)).toBe('0');
    });
});

describe('formatarData', () => {
    it('converte ISO para DD/MM/YYYY', () => {
        expect(formatarData('2024-07-26')).toBe('26/07/2024');
    });

    it('converte data de 1958', () => {
        expect(formatarData('1958-05-22')).toBe('22/05/1958');
    });

    it('mantém formato desconhecido', () => {
        expect(formatarData('26/07/2024')).toBe('26/07/2024');
    });

    it('mantém string vazia', () => {
        expect(formatarData('')).toBe('');
    });
});

describe('listarEmPortugues', () => {
    it('junta dois itens com "e"', () => {
        expect(listarEmPortugues(['STF', 'STJ'])).toBe('STF e STJ');
    });

    it('junta três itens com vírgula e "e"', () => {
        expect(listarEmPortugues(['A', 'B', 'C'])).toBe('A, B e C');
    });

    it('junta um item só', () => {
        expect(listarEmPortugues(['STF'])).toBe('STF');
    });

    it('junta lista vazia', () => {
        expect(listarEmPortugues([])).toBe('');
    });
});
