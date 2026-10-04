// ============================================
// Configuração das coleções de conteúdo
// Astro 7 usa o Content Layer API:
// - arquivo em src/content.config.ts
// - cada coleção tem um `loader`
// - sem `type: 'content'`
// ============================================
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const conteudo = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/conteudo' }),
    schema: z.object({
        titulo: z.string(),
        descricao: z.string(),
        categoria: z.enum(['Conceito', 'Jurimetria', 'Guia']),
        atualizado: z.string(),
        ordem: z.number().optional(),
    }),
});

export const collections = { conteudo };
