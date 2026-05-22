import * as Speech from "expo-speech";

/**
 * Speak a single word using the device's TTS engine.
 * Calling this while already speaking the same word will stop it.
 * Calling this while a *different* word is playing replaces it.
 *
 * @param {string} word  Plain English word (not IPA).
 * @param {object} opts  { onDone, onError, onStopped } callbacks.
 */
export function speakWord(word, { onDone, onError, onStopped } = {}) {
  // Always flush any current speech first so the new word starts immediately.
  Speech.stop();
  Speech.speak(word, {
    language: "en-US",
    pitch: 1.0,
    rate: 0.85, // slightly slower = clearer pronunciation
    onDone,
    onError,
    onStopped,
  });
}

/** Hard-stop any in-progress speech. Safe to call when nothing is playing. */
export function stopSpeech() {
  Speech.stop();
}
