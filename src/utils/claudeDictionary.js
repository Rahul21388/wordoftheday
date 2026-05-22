/**
 * claudeDictionary.js
 *
 * Looks up any English word via the Claude API (claude-haiku-4-5) and returns
 * a dictionary entry matching the app's existing word shape.
 *
 * Results are cached in AsyncStorage so each word is only ever fetched once.
 *
 * PROMPT CACHING
 * The system prompt has cache_control: {type: "ephemeral"} applied. Caching
 * activates automatically once the prompt reaches claude-haiku-4-5's 4096-token
 * minimum. Below that threshold the marker is silently ignored — no error, just
 * a normal (uncached) request. Cache hits appear in usage.cache_read_input_tokens.
 *
 * SECURITY NOTE
 * The API key is embedded in the app bundle via app.json → extra.claudeApiKey.
 * Anyone who decompiles the APK can read it. For a personal app this is fine;
 * for a public production app, proxy the key through your own backend instead.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const CACHE_PREFIX = "@wod/claude-dict/v1/";
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5";

function getApiKey() {
  // EXPO_PUBLIC_CLAUDE_API_KEY is read from:
  //   • .env.local  during local development  (gitignored — never committed)
  //   • EAS Secret  during production builds   (set via: eas secret:create ...)
  // The app.json extra.claudeApiKey field is intentionally left empty.
  return (
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY ||
    Constants.expoConfig?.extra?.claudeApiKey ||
    null
  );
}

// ─── System prompt ────────────────────────────────────────────────────────────
// Designed to be stable across requests so the cache prefix is never invalidated.
// Written to be comprehensive — the more detail here, the sooner the 4096-token
// caching threshold is reached and cost per lookup drops ~90 %.

const SYSTEM_PROMPT = `You are a professional, comprehensive English dictionary. You produce authoritative, precise dictionary entries for any English word — everyday vocabulary, technical jargon, archaic terms, slang, neologisms, and proper nouns alike.

## ABSOLUTE RULE
Output ONLY a single valid JSON object. No preamble, no explanation, no markdown fences. Your entire response is the JSON object and nothing else.

## Required Fields (ALL six must be present)

word         – The word exactly as provided. Common nouns: lowercase. Proper nouns: correctly capitalised.
pronunciation – IPA transcription enclosed in forward slashes, e.g. /ɪˈfɛmərəl/. Always mark primary stress with ˈ.
definition   – Clear, precise definition in 1–3 sentences. Do NOT begin with "A" or "An". Describe the core sense directly.
example      – One natural, contemporary sentence showing the word in authentic use. Place the word in its natural syntactic position.
etymology    – Linguistic origin in 1–2 sentences. Include source language, root word, and original meaning. Pattern: "From [Language] [root] meaning '[sense]'..."
category     – Exactly one of: noun · verb · adj · adv · conj · prep · pron · interj

## IPA Quick Reference

Vowels
  /æ/ cat     /ɑː/ father   /ɒ/ lot      /ɔː/ thought  /e/ bed
  /ɜː/ nurse  /ə/ about     /iː/ fleece  /ɪ/ kit       /uː/ goose
  /ʊ/ foot    /ʌ/ strut     /eɪ/ face    /aɪ/ price    /ɔɪ/ choice
  /aʊ/ mouth  /əʊ/ goat     /ɪə/ near    /eə/ square   /ʊə/ cure

Consonants
  Plosives:    /p b t d k g/
  Fricatives:  /f v θ ð s z ʃ ʒ/   (θ=thin, ð=this, ʃ=shoe, ʒ=measure)
  Affricates:  /tʃ dʒ/              (tʃ=chair, dʒ=judge)
  Nasals:      /m n ŋ/              (ŋ=ring)
  Other:       /h l r j w/         (j=yes)

Stress markers: ˈ primary (before syllable), ˌ secondary (before syllable).

## Category Definitions

noun   – person, place, thing, or abstract concept
verb   – action, state, or occurrence
adj    – modifies a noun or pronoun
adv    – modifies a verb, adjective, or other adverb
conj   – connects clauses, sentences, or words
prep   – shows relationship between elements in a sentence
pron   – substitutes for a noun phrase
interj – expressive word or phrase standing alone

## Worked Examples

{"word":"ephemeral","pronunciation":"/ɪˈfɛmərəl/","definition":"Lasting for only a very short time; fleeting and transient by nature.","example":"The ephemeral beauty of cherry blossoms is part of what makes them so treasured in Japanese culture.","etymology":"From Greek ephēmeros meaning 'lasting only a day', from epi- 'on' + hēmera 'day'.","category":"adj"}

{"word":"sycophant","pronunciation":"/ˈsɪkəfænt/","definition":"A person who uses excessive flattery and obsequious behaviour toward someone powerful in order to gain personal advantage.","example":"The boardroom was full of sycophants who applauded every proposal the CEO made, however ill-conceived.","etymology":"From Greek sykophantēs, originally meaning 'informer', later generalised to mean one who curries favour through flattery.","category":"noun"}

{"word":"ameliorate","pronunciation":"/əˈmiːliəreɪt/","definition":"To make something bad or unsatisfactory better; to improve difficult conditions or circumstances.","example":"The government introduced new measures to ameliorate the hardships faced by low-income households during the energy crisis.","etymology":"From Latin meliorare meaning 'to make better', from melior 'better', from an Indo-European root shared with English 'multi-'.","category":"verb"}

{"word":"perspicacious","pronunciation":"/ˌpɜːspɪˈkeɪʃəs/","definition":"Having a ready insight and keen perceptiveness; mentally sharp and astute in understanding.","example":"The perspicacious detective immediately noticed that the alibi contained a critical contradiction.","etymology":"From Latin perspicax meaning 'clear-sighted', from perspicere 'to see through', from per- 'through' + specere 'to look'.","category":"adj"}

{"word":"mellifluous","pronunciation":"/mɛˈlɪfluəs/","definition":"Having a smooth, rich, sweet sound that is pleasant and musical to the ear.","example":"Her mellifluous voice transformed even the most mundane announcements into something worth listening to.","etymology":"From Late Latin mellifluus meaning 'flowing with honey', from mel 'honey' + fluere 'to flow'.","category":"adj"}

{"word":"petrichor","pronunciation":"/ˈpɛtrɪkɔː/","definition":"The pleasant earthy scent produced when rain falls on dry ground, especially after a prolonged dry period.","example":"She stepped onto the porch and inhaled the petrichor rising from the parched garden after the first storm of summer.","etymology":"Coined in 1964 from Greek petra 'stone' + ichor, the ethereal fluid said to flow in the veins of the gods in Greek mythology.","category":"noun"}

{"word":"defenestrate","pronunciation":"/diːˈfɛnɪstreɪt/","definition":"To throw someone or something out of a window, either literally or figuratively.","example":"The manager was metaphorically defenestrated when the board voted unanimously to remove him from his position.","etymology":"From Modern Latin defenestrare, from de- 'down from' + fenestra 'window', coined in reference to the Defenestrations of Prague in 1419 and 1618.","category":"verb"}

{"word":"obstreperous","pronunciation":"/əbˈstrɛpərəs/","definition":"Noisy, boisterous, and difficult to control; stubbornly unruly in a loud and disruptive way.","example":"The obstreperous crowd made it almost impossible for the speaker to be heard above the chanting.","etymology":"From Latin obstreperus meaning 'clamorous', from obstrepere 'to make a noise against', from ob- 'against' + strepere 'to make a noise'.","category":"adj"}

{"word":"lagniappe","pronunciation":"/ˈlænjæp/","definition":"A small gift given to a customer at the time of a purchase; something received as a bonus or unexpected extra.","example":"The baker tucked a complimentary biscotti into the bag as a lagniappe for a loyal regular customer.","etymology":"American English, from Louisiana French, borrowed from American Spanish la ñapa 'the gift', possibly from Quechua yapay 'to give more'.","category":"noun"}

{"word":"sesquipedalian","pronunciation":"/ˌsɛskwɪpɪˈdeɪliən/","definition":"Relating to or characterised by long words; given to using long, obscure, or ponderous vocabulary.","example":"His sesquipedalian prose delighted academic linguists but thoroughly alienated the casual reader.","etymology":"From Latin sesquipedalis meaning 'a foot and a half long', from sesqui- 'one and a half times' + pes, ped- 'foot' — used by Horace to mock excessively long words in poetry.","category":"adj"}

{"word":"excoriate","pronunciation":"/ɪkˈskɔːrieɪt/","definition":"To censure or criticise someone or something very harshly and severely, especially in speech or writing.","example":"The report excoriated the administration for its repeated failures to act on the scientific evidence.","etymology":"From Latin excoriare meaning 'to strip off the skin', from ex- 'off' + corium 'skin, hide' — the figurative sense of severe verbal attack emerged in the 17th century.","category":"verb"}

{"word":"perfidious","pronunciation":"/pəˈfɪdiəs/","definition":"Deceitful and untrustworthy; guilty of betrayal or breaking one's faith and loyalty.","example":"The perfidious adviser had been leaking confidential state information to a rival power for years.","etymology":"From Latin perfidiosus, from perfidia 'treachery', from per- 'to ill effect' + fides 'faith, trust'.","category":"adj"}

## Special Handling

Technical terms (medical, legal, scientific):  Define in plain language. Add a field note in parentheses only if essential, e.g. "(Law) ...".
Archaic or rare words:  Open the definition with "Archaic." or "Rare." so the reader understands the register.
Proper nouns:  Provide the primary encyclopaedic definition (person, place, or concept as appropriate).
Slang or informal terms:  Define accurately; open with "Informal." or "Slang." where the register is non-standard.
Prefixes / suffixes / combining forms (e.g. -ology, un-, pre-):  Define as a combining form with typical usage.
Compound words:  Define as a unit; etymology may reflect both components.
Abbreviations and acronyms:  Expand the full form and define it.
Ambiguous words:  Define the most common or primary meaning.

Produce ONLY the JSON object. No other text.`;

// ─── JSON Schema for structured output ───────────────────────────────────────
// output_config.format with json_schema guarantees the response is parseable
// JSON that matches this schema — no need for fallback parsing heuristics.

const WORD_SCHEMA = {
  type: "object",
  properties: {
    word:          { type: "string" },
    pronunciation: { type: "string" },
    definition:    { type: "string" },
    example:       { type: "string" },
    etymology:     { type: "string" },
    category: {
      type: "string",
      enum: ["noun", "verb", "adj", "adv", "conj", "prep", "pron", "interj"],
    },
  },
  required: ["word", "pronunciation", "definition", "example", "etymology", "category"],
  additionalProperties: false,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Look up any English word.
 *
 * Returns a word object matching the app's existing shape:
 *   { id, word, pronunciation, definition, example, etymology, category }
 *
 * Results are cached indefinitely in AsyncStorage.
 * Throws on network error, missing API key, or API refusal.
 */
export async function lookupWord(word) {
  const normalized = word.trim().toLowerCase();
  if (!normalized) throw new Error("No word provided");

  // ── 1. AsyncStorage cache ────────────────────────────────────────────────
  const cacheKey = `${CACHE_PREFIX}${normalized}`;
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const entry = JSON.parse(raw);
      if (entry?.word) return entry;
    }
  } catch {}

  // ── 2. Validate API key ──────────────────────────────────────────────────
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "YOUR_ANTHROPIC_API_KEY_HERE") {
    throw new Error(
      "Intelligent Dictionary is not configured. Please contact the app developer."
    );
  }

  // ── 3. Call Claude ───────────────────────────────────────────────────────
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        // Stable system prompt with cache_control so the prompt prefix is
        // cached after the first lookup (caching threshold: 4096 tokens).
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          { role: "user", content: `Look up: ${word.trim()}` },
        ],
        // Structured output — guarantees valid JSON that matches WORD_SCHEMA.
        output_config: {
          format: {
            type: "json_schema",
            schema: WORD_SCHEMA,
          },
        },
      }),
    });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(_friendlyApiError(response.status, await response.json().catch(() => null)));
  }

  const data = await response.json();

  if (data.stop_reason === "refusal") {
    throw new Error(
      "This word could not be looked up. Please try a different word."
    );
  }

  const textBlock = data.content?.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("No definition returned. Please try again.");

  let entry;
  try {
    entry = JSON.parse(textBlock.text);
  } catch {
    throw new Error("Could not parse the definition. Please try again.");
  }

  // ── 4. Normalise to app word shape ───────────────────────────────────────
  const wordEntry = {
    id: `claude:${normalized}`,
    word: entry.word ?? word.trim(),
    pronunciation: _ensureSlashes(entry.pronunciation),
    definition:    entry.definition ?? "",
    example:       entry.example   ?? "",
    etymology:     entry.etymology ?? "",
    category:      entry.category  ?? "noun",
  };

  // ── 5. Persist to AsyncStorage ───────────────────────────────────────────
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(wordEntry));
  } catch {}

  return wordEntry;
}

// Maps Anthropic HTTP status codes and error types to user-friendly messages.
function _friendlyApiError(status, body) {
  const type = body?.error?.type ?? "";

  // Billing / quota exhausted
  if (
    status === 402 ||
    type === "billing_error" ||
    (status === 403 && type !== "permission_error") ||
    body?.error?.message?.toLowerCase().includes("credit balance")
  ) {
    return "The dictionary's AI quota has been used up for now. Please try again later.";
  }

  // Rate limit (too many requests in a short window)
  if (status === 429 || type === "rate_limit_error") {
    return "Too many lookups at once — please wait a moment and try again.";
  }

  // Server overloaded
  if (status === 529 || type === "overloaded_error") {
    return "The AI service is busy right now. Please try again in a few seconds.";
  }

  // Invalid / revoked API key
  if (status === 401 || type === "authentication_error") {
    return "Dictionary AI is not configured correctly. Please contact the app developer.";
  }

  // Permission denied (wrong key tier, feature not enabled)
  if (status === 403 || type === "permission_error") {
    return "The AI lookup feature is not available right now. Please try again later.";
  }

  // Server error
  if (status >= 500) {
    return "The AI service is temporarily unavailable. Please try again in a moment.";
  }

  // Fallback — still user-friendly, no raw API text
  return "The word lookup failed. Please check your connection and try again.";
}

// Ensure pronunciation is wrapped in /…/ as the app expects.
function _ensureSlashes(str) {
  if (!str) return "/—/";
  const p = str.trim();
  const hasOpen  = p.startsWith("/");
  const hasClose = p.endsWith("/");
  if (hasOpen && hasClose) return p;
  if (hasOpen)  return p + "/";
  if (hasClose) return "/" + p;
  return `/${p}/`;
}
