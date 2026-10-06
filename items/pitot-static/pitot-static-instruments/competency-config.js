/*
 * Competency check settings. This is the one file an instructor edits.
 * Open it in any text editor, change a number, and save. No other file needs to change.
 *
 *   passMark     The score, in percent (0 to 100), a trainee needs to meet the passing mark.
 *                The default is 80.
 *   retryCredit  How much of a point a question earns when it is answered correctly on the
 *                one allowed retry (0 to 1).
 *                0 = only first-time answers count (the default). 1 = a retry earns full credit.
 *                Use a value like 0.5 for half credit.
 *
 * This is a plain .js file, not JSON, so the check still works when opened from a folder on a computer.
 */
window.COMPETENCY_CONFIG = {
  passMark: 80,
  retryCredit: 0
};
