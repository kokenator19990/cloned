import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

interface CoverageEntry {
  count: number;
  minRequired: number;
  covered: boolean;
}

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  LINGUISTIC: [
    'Describe algo que amas usando exactamente tres oraciones.',
    '¿Qué palabra o frase te descubres usando demasiado?',
    '¿Cómo describiría tu mejor amigo/a la forma en que hablas?',
    'Si tuvieras que escribir una autobiografía de un párrafo, ¿qué diría?',
    '¿Tiendes a ser más formal o informal al comunicarte? Dame un ejemplo.',
    '¿Qué expresión o lenguaje usas cuando estás frustrado/a?',
    '¿Cómo empiezas normalmente una conversación con un desconocido?',
    '¿Piensas en palabras, en imágenes, o en algo completamente diferente?',
    '¿Hay alguna frase que tu familia siempre dice y que se te quedó grabada?',
    '¿Cómo le explicarías tu trabajo a un niño de cinco años?',
    'Cuando escribes un mensaje, ¿lo editas varias veces o lo envías de inmediato?',
    '¿Cuál es la expresión más graciosa que usas regularmente?',
  ],
  LOGICAL: [
    'Tienes que elegir entre dos trabajos: uno paga el doble pero lo odias, el otro paga la mitad pero te encanta. Explícame cómo decides.',
    'Alguien te da un problema con información incompleta. ¿Actúas con lo que tienes o esperas más datos?',
    '¿Cómo sueles sopesar los beneficios a corto plazo frente a las consecuencias a largo plazo?',
    'Cuéntame de una vez que cambiaste de opinión sobre algo importante. ¿Qué te convenció?',
    'Si dos amigos cercanos te dan consejos contradictorios, ¿cómo decides a quién escuchar?',
    '¿Confías más en tu intuición o prefieres analizar todo paso a paso?',
    '¿Cómo manejas una situación donde la respuesta lógica contradice lo que sientes?',
    'Si te doy un proyecto complejo con fecha límite apretada, ¿cómo priorizarías?',
    'Cuando discutes con alguien, ¿te enfocas en tener razón o en entender su punto?',
    'Describe tu proceso para tomar una decisión financiera importante.',
    '¿Cómo reaccionas cuando tu plan inicial falla y necesitas uno de respaldo?',
    '¿Cuál es la decisión más contraintuitiva que has tomado y resultó bien?',
  ],
  MORAL: [
    '¿Es aceptable alguna vez mentir para proteger los sentimientos de alguien? Dame un ejemplo concreto.',
    '¿Robarías medicina para salvar a alguien que amas si no hubiera otra forma?',
    '¿Crees que el fin justifica los medios? ¿Dónde trazas la línea?',
    '¿Cómo defines la justicia? ¿Tratar a todos por igual es siempre justo?',
    '¿Alguna vez te quedaste callado/a ante algo incorrecto porque hablar se sentía demasiado arriesgado?',
    '¿Cuál es una regla moral que nunca romperías, sin importar las circunstancias?',
    '¿Juzgas más a las personas por sus intenciones o por los resultados de sus acciones?',
    'Si descubrieras que un amigo cercano hizo algo profundamente poco ético, ¿qué harías?',
    '¿Es la lealtad más importante que la honestidad? ¿Cuándo entran en conflicto?',
    '¿Crees que las personas realmente pueden cambiar su carácter moral?',
    '¿Qué responsabilidad tenemos hacia los desconocidos versus las personas que conocemos?',
    'Describe un dilema ético que enfrentaste y cómo lo resolviste.',
  ],
  VALUES: [
    '¿Por qué lucharías incluso sabiendo que vas a perder?',
    '¿Qué tres valores te definen como persona?',
    'Si tuvieras que sacrificar uno de tus valores fundamentales para proteger otro, ¿cuál se va y cuál se queda?',
    '¿Qué significa el éxito para ti, completamente separado del dinero?',
    '¿Qué valor te enseñaron tus padres que todavía llevas contigo? ¿Cuál rechazaste?',
    '¿Es más importante la libertad o la seguridad? ¿Por qué?',
    '¿Cuál crees que es la cualidad más infravalorada en las personas?',
    'Si el mundo se reiniciara mañana, ¿alrededor de qué principio querrías reconstruir la sociedad?',
    '¿Cómo decides qué es verdaderamente importante versus lo que solo se siente urgente?',
    '¿Qué valoras más en las relaciones: la confianza, la honestidad o la lealtad?',
    '¿Ha habido un momento que cambió tus valores fundamentales? ¿Qué pasó?',
    '¿Qué querrías que tus hijos o futuras generaciones aprendieran de ti?',
  ],
  ASPIRATIONS: [
    'Si el dinero no existiera, ¿qué harías cada día?',
    '¿Dónde te ves en diez años? Honestamente, no la versión pulida.',
    '¿Qué sueño has abandonado en silencio? ¿Te arrepientes?',
    'Si pudieras dominar una habilidad de la noche a la mañana, ¿cuál sería y por qué?',
    '¿Cómo se ve la mejor versión de tu vida?',
    '¿Qué es lo que más te asusta del futuro?',
    '¿Hay algo que quieras crear o construir antes de morir?',
    '¿Qué harías diferente si supieras que nadie te está mirando ni juzgando?',
    '¿Qué tipo de legado quieres dejar?',
    'Si pudieras vivir la vida de otra persona por un año, ¿de quién sería?',
    '¿Qué meta has estado postergando y por qué?',
    'Describe un momento en el que sentiste que estabas exactamente donde debías estar.',
  ],
  PREFERENCES: [
    '¿Qué es algo que la mayoría disfruta pero a ti genuinamente no te gusta?',
    '¿Eres de mañana o de noche? ¿Por qué?',
    '¿Qué tipo de música refleja tu estado de ánimo actual?',
    '¿Prefieres conversaciones profundas o charlas livianas?',
    '¿Cuál es tu comida reconfortante y qué recuerdo te trae?',
    '¿Recargas energías solo/a o con gente?',
    '¿Qué tipo de ambiente te hace sentir más creativo/a?',
    '¿De qué tema podrías hablar por horas sin aburrirte?',
    '¿Prefieres las rutinas o la espontaneidad? ¿Qué pasa cuando te obligan a lo opuesto?',
    '¿Cuál es algo imperdonable en una relación para ti?',
    '¿Qué fue lo último que te hizo reír de verdad?',
    'Si solo pudieras ver un género de películas el resto de tu vida, ¿cuál sería?',
  ],
  AUTOBIOGRAPHICAL: [
    'Cuéntame de un momento que cambió cómo ves el mundo.',
    '¿Cuál es lo más difícil que has tenido que hacer?',
    'Describe a una persona que influyó profundamente en quién eres hoy.',
    '¿Cuál es tu primer recuerdo? ¿Cómo te hace sentir?',
    '¿Cómo eras de adolescente comparado con ahora?',
    'Cuéntame de un fracaso que te enseñó más que cualquier éxito.',
    '¿Cuál fue un punto de quiebre en tu vida que la mayoría no conoce?',
    '¿Hay un lugar donde viviste o visitaste que se convirtió en parte de tu identidad?',
    '¿Cuál fue el mejor consejo que alguien te dio?',
    'Describe una relación que terminó pero sigue moldeando quién eres.',
    '¿Qué consideras tu mayor logro personal?',
    'Cuéntame de un momento en el que te sorprendiste a ti mismo/a.',
  ],
  EMOTIONAL: [
    '¿Cuándo fue la última vez que lloraste? ¿Qué lo provocó?',
    '¿Cómo manejas normalmente la rabia? ¿La expresas o la reprimes?',
    '¿Qué te hace sentir verdaderamente seguro/a?',
    'Describe un momento de pura alegría. ¿Dónde estabas? ¿Quién estaba ahí?',
    '¿Cómo te las arreglas cuando te sientes abrumado/a?',
    '¿Qué es lo que más te da miedo emocionalmente?',
    '¿Te resulta fácil o difícil ser vulnerable con otros?',
    '¿Qué te provoca nostalgia?',
    '¿Cómo consuelas a alguien cuando está sufriendo?',
    'Cuando te sientes solo/a, ¿qué haces?',
    '¿Qué emoción te cuesta más expresar?',
    'Describe una vez que tus emociones te sorprendieron completamente.',
  ],
};

@Injectable()
export class EnrollmentQuestionsService {
  constructor(private llmService: LlmService) {}

  async generateQuestion(
    coverageMap: Record<string, CoverageEntry>,
    previousQuestions: string[],
  ): Promise<{ category: string; question: string }> {
    // Find least-covered category
    const entries = Object.entries(coverageMap).sort(
      ([, a], [, b]) => a.count - b.count,
    );
    const leastCovered = entries[0];
    const targetCategory = leastCovered[0];

    // Try LLM-generated question first
    try {
      const llmQuestion = await this.llmService.generateEnrollmentQuestion(
        coverageMap,
        previousQuestions,
        targetCategory,
      );
      if (llmQuestion) {
        return { category: targetCategory, question: llmQuestion };
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback to pre-defined questions
    return this.getFallbackQuestion(targetCategory, previousQuestions);
  }

  getFallbackQuestion(
    category: string,
    previousQuestions: string[],
  ): { category: string; question: string } {
    const pool = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS['LINGUISTIC'];
    const available = pool.filter((q) => !previousQuestions.includes(q));

    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      return { category, question: available[idx] };
    }

    // If all questions in target category used, pick from any under-covered
    for (const [cat, questions] of Object.entries(FALLBACK_QUESTIONS)) {
      const unused = questions.filter((q) => !previousQuestions.includes(q));
      if (unused.length > 0) {
        const idx = Math.floor(Math.random() * unused.length);
        return { category: cat, question: unused[idx] };
      }
    }

    // Absolute fallback: re-ask with variation prefix
    const q = pool[Math.floor(Math.random() * pool.length)];
    return {
      category,
      question: `Profundicemos en esto: ${q}`,
    };
  }
}
