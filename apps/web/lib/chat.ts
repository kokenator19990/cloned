// ── Chat Intelligence Layer ──
// Generates responses based on the clone's cognitive profile

import type { CloneProfile, QA } from './localStore';

interface ResponseContext {
    userMessage: string;
    answers: QA[];
    cloneName: string;
}

/**
 * Builds a cognitive profile prompt from all the clone's answers
 */
function buildCognitiveProfile(answers: QA[]): string {
    // Group answers by category
    const byCategory: Record<string, QA[]> = {};
    for (const qa of answers) {
        if (!byCategory[qa.category]) byCategory[qa.category] = [];
        byCategory[qa.category].push(qa);
    }

    let profile = '';
    for (const [category, qas] of Object.entries(byCategory)) {
        profile += `\n[${category.toUpperCase()}]\n`;
        for (const qa of qas.slice(0, 10)) { // Top 10 per category
            profile += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
        }
    }

    return profile;
}

/**
 * Generates a response using cognitive matching + contextual reasoning
 */
export function generateCognitiveResponse(context: ResponseContext): {
    text: string;
    audioUrl?: string;
} {
    const { userMessage, answers, cloneName } = context;

    if (answers.length === 0) {
        return {
            text: `Hola, soy ${cloneName}. Todavía no tengo suficientes recuerdos para poder conversar bien contigo. Necesito que respondas más preguntas sobre mí.`,
        };
    }

    const msgLower = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ── Stage 1: Exact semantic match ──
    const exactMatch = findExactMatch(msgLower, answers);
    if (exactMatch) {
        return {
            text: naturalizeResponse(exactMatch.answer, cloneName),
            audioUrl: exactMatch.audioUrl,
        };
    }

    // ── Stage 2: Category-based inference ──
    const categoryMatch = findCategoryMatch(msgLower, answers);
    if (categoryMatch) {
        return {
            text: inferFromCategory(userMessage, categoryMatch, cloneName),
            audioUrl: categoryMatch.audioUrl,
        };
    }

    // ── Stage 3: Personality-based fallback ──
    return generatePersonalityFallback(answers, cloneName);
}

/**
 * Find exact or very close semantic match
 */
function findExactMatch(msgLower: string, answers: QA[]): QA | null {
    const stopwords = new Set(['que', 'como', 'cual', 'por', 'para', 'con', 'una', 'los', 'las', 'del', 'eres', 'haces', 'tiene', 'esta', 'ese', 'esa']);
    const keywords = msgLower.split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w));

    let bestMatch: { score: number; qa: QA } | null = null;

    for (const qa of answers) {
        const combined = (qa.question + ' ' + qa.answer).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let score = 0;

        for (const kw of keywords) {
            if (combined.includes(kw)) score += 2;
        }

        // Bonus for question similarity
        const qLower = qa.question.toLowerCase();
        for (const kw of keywords) {
            if (qLower.includes(kw)) score += 3;
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { score, qa };
        }
    }

    return bestMatch && bestMatch.score >= 4 ? bestMatch.qa : null;
}

/**
 * Find best category match
 */
function findCategoryMatch(msgLower: string, answers: QA[]): QA | null {
    const categoryKeywords: Record<string, string[]> = {
        personalidad: ['personalidad', 'caracter', 'persona', 'como eres', 'describir', 'eres'],
        valores: ['valor', 'importante', 'principio', 'creer', 'moral', 'etica'],
        recuerdos: ['recuerdo', 'memoria', 'pasado', 'cuando eras', 'infancia', 'momento', 'vez'],
        humor: ['chiste', 'gracioso', 'reir', 'humor', 'divertido', 'chistoso'],
        habitos: ['habito', 'rutina', 'dia', 'costumbre', 'hacer', 'manana', 'noche'],
        opiniones: ['opinar', 'pensar', 'creer', 'opinion', 'sobre'],
        relaciones: ['relacion', 'amigo', 'familia', 'pareja', 'amor', 'gente'],
        suenos: ['sueno', 'futuro', 'querer', 'desear', 'meta', 'plan', 'aspirar'],
        filosofia: ['vida', 'sentido', 'muerte', 'existir', 'filosof', 'proposito'],
        gustos: ['favorito', 'gustar', 'preferir', 'comida', 'musica', 'pelicula', 'libro'],
        identidad: ['identidad', 'quien', 'definir', 'nombre', 'soy'],
        miedos: ['miedo', 'temer', 'asustar', 'preocupar', 'nervioso', 'ansiedad'],
        emociones: ['sentir', 'emocion', 'feliz', 'triste', 'enojado', 'emocionado'],
    };

    for (const [cat, catKws] of Object.entries(categoryKeywords)) {
        if (catKws.some((kw) => msgLower.includes(kw))) {
            const catAnswers = answers.filter((a) => a.category === cat);
            if (catAnswers.length > 0) {
                return catAnswers[Math.floor(Math.random() * catAnswers.length)];
            }
        }
    }

    return null;
}

/**
 * Infer response from category context
 */
function inferFromCategory(userMessage: string, qa: QA, cloneName: string): string {
    const connectors = [
        `Bueno, cuando me preguntaron "${qa.question}", yo respondí: "${qa.answer}". Eso creo que responde a lo que me preguntas.`,
        `Mmm, déjame pensar... Creo que lo que puedo decirte sobre eso es: ${qa.answer}`,
        `Sobre eso, una vez me preguntaron algo parecido y dije: ${qa.answer}`,
        `Te cuento algo relacionado: ${qa.answer}`,
        qa.answer,
    ];

    return connectors[Math.floor(Math.random() * connectors.length)];
}

/**
 * Naturalize a direct answer
 */
function naturalizeResponse(answer: string, cloneName: string): string {
    const intros = ['', 'Mira, ', 'Te cuento: ', 'A ver... ', 'Pues, ', 'Sabes, ', 'Bueno, '];
    const intro = intros[Math.floor(Math.random() * intros.length)];
    return intro + answer;
}

/**
 * Generate fallback based on overall personality
 */
function generatePersonalityFallback(answers: QA[], cloneName: string): {
    text: string;
    audioUrl?: string;
} {
    const randomQA = answers[Math.floor(Math.random() * answers.length)];

    const fallbacks = [
        `Mmm, buena pregunta. No tengo una respuesta exacta, pero te puedo decir algo que sí sé: ${randomQA.answer}`,
        `No estoy seguro de cómo responder eso exactamente. Pero cuando me preguntaron "${randomQA.question}", dije: "${randomQA.answer}"`,
        `Esa es una pregunta interesante. Déjame pensar... Algo que viene a mi mente es: ${randomQA.answer}`,
        randomQA.answer,
    ];

    return {
        text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        audioUrl: randomQA.audioUrl,
    };
}

/**
 * Advanced: Use local LLM-style reasoning (future enhancement)
 * This would require WebLLM or similar in-browser inference
 */
export function generateWithLLM(context: ResponseContext): Promise<string> {
    // Placeholder for future WebLLM integration
    const profile = buildCognitiveProfile(context.answers);
    const systemPrompt = `Eres ${context.cloneName}. Debes responder EXACTAMENTE como esta persona lo haría, basándote en su perfil cognitivo:\n\n${profile}\n\nMantén su estilo, valores, y forma de expresarse. NO digas "como IA" ni "no puedo". Eres ${context.cloneName}.`;

    // TODO: Integrate WebLLM here
    console.log('LLM prompt ready:', systemPrompt);

    return Promise.resolve(generateCognitiveResponse(context).text);
}
