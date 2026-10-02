import { describe, expect, it } from 'vitest';
import {
    validarArea,
    validarEmail,
    validarEscritorio,
    validarNome,
    validarTamanho,
} from '../src/lib/validacao';

const AREAS = ['Cível', 'Criminal', 'Tributário'];
const TAMANHOS = ['Autônomo', '2 a 5 advogados'];

describe('validarNome', () => {
    it('rejeita nome vazio', () => {
        expect(validarNome('')).not.toBeNull();
    });

    it('rejeita nome só com espaços', () => {
        expect(validarNome('   ')).not.toBeNull();
    });

    it('rejeita nome com 1 caractere', () => {
        expect(validarNome('A')).not.toBeNull();
    });

    it('aceita nome com 2 caracteres', () => {
        expect(validarNome('Li')).toBeNull();
    });

    it('aceita nome completo', () => {
        expect(validarNome('Maria Silva')).toBeNull();
    });

    it('aceita nome com espaços nas pontas', () => {
        expect(validarNome('  Maria Silva  ')).toBeNull();
    });
});

describe('validarEmail', () => {
    it('rejeita e-mail vazio', () => {
        expect(validarEmail('')).not.toBeNull();
    });

    it('rejeita e-mail sem @', () => {
        expect(validarEmail('maria.escritorio.com')).not.toBeNull();
    });

    it('rejeita e-mail sem domínio', () => {
        expect(validarEmail('maria@')).not.toBeNull();
    });

    it('rejeita e-mail sem TLD', () => {
        expect(validarEmail('maria@escritorio')).not.toBeNull();
    });

    it('rejeita e-mail com espaço', () => {
        expect(validarEmail('maria @escritorio.com')).not.toBeNull();
    });

    it('aceita e-mail simples', () => {
        expect(validarEmail('maria@escritorio.com')).toBeNull();
    });

    it('aceita e-mail com subdomínio', () => {
        expect(validarEmail('maria@escritorio.adv.br')).toBeNull();
    });

    it('aceita e-mail com pontos e hífens', () => {
        expect(
            validarEmail('maria.silva-torres@escritorio-adv.com.br'),
        ).toBeNull();
    });
});

describe('validarEscritorio', () => {
    it('rejeita escritório vazio', () => {
        expect(validarEscritorio('')).not.toBeNull();
    });

    it('rejeita escritório só com espaços', () => {
        expect(validarEscritorio('   ')).not.toBeNull();
    });

    it('aceita escritório com nome', () => {
        expect(validarEscritorio('Silva Advogados')).toBeNull();
    });
});

describe('validarArea', () => {
    it('rejeita área vazia', () => {
        expect(validarArea('', AREAS)).not.toBeNull();
    });

    it('rejeita área que não está na lista', () => {
        expect(validarArea('Direito Espacial', AREAS)).not.toBeNull();
    });

    it('aceita área que está na lista', () => {
        expect(validarArea('Cível', AREAS)).toBeNull();
    });
});

describe('validarTamanho', () => {
    it('rejeita tamanho vazio', () => {
        expect(validarTamanho('', TAMANHOS)).not.toBeNull();
    });

    it('rejeita tamanho que não está na lista', () => {
        expect(validarTamanho('100 advogados', TAMANHOS)).not.toBeNull();
    });

    it('aceita tamanho que está na lista', () => {
        expect(validarTamanho('Autônomo', TAMANHOS)).toBeNull();
    });
});
