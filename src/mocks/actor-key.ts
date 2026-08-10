/**
 * Where the mocked API reads who is acting. Its own file, with no imports, so
 * the Playwright fixture that plants it shares the constant instead of copying
 * the string.
 */
export const MOCK_ACTOR_KEY = 'lennix.mock-actor'
