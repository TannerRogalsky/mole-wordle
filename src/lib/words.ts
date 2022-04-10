import { WORDS } from '../constants/wordlist'
import { VALID_GUESSES } from '../constants/validGuesses'
import { WRONG_SPOT_MESSAGE, NOT_CONTAINED_MESSAGE } from '../constants/strings'
import { getGuessStatuses } from './statuses'
import { default as GraphemeSplitter } from 'grapheme-splitter'
import { getIndexOffset } from './localStorage'

export const isWordInWordList = (word: string) => {
  return (
    WORDS.includes(localeAwareLowerCase(word)) ||
    VALID_GUESSES.includes(localeAwareLowerCase(word))
  )
}

export const isWinningWord = (word: string) => {
  return solution === word
}

// build a set of previously revealed letters - present and correct
// guess must use correct letters in that space and any other revealed letters
// also check if all revealed instances of a letter are used (i.e. two C's)
export const findFirstUnusedReveal = (word: string, guesses: string[]) => {
  if (guesses.length === 0) {
    return false
  }

  const lettersLeftArray = new Array<string>()
  const guess = guesses[guesses.length - 1]
  const statuses = getGuessStatuses(guess)
  const splitWord = unicodeSplit(word)
  const splitGuess = unicodeSplit(guess)

  for (let i = 0; i < splitGuess.length; i++) {
    if (statuses[i] === 'correct' || statuses[i] === 'present') {
      lettersLeftArray.push(splitGuess[i])
    }
    if (statuses[i] === 'correct' && splitWord[i] !== splitGuess[i]) {
      return WRONG_SPOT_MESSAGE(splitGuess[i], i + 1)
    }
  }

  // check for the first unused letter, taking duplicate letters
  // into account - see issue #198
  let n
  for (const letter of splitWord) {
    n = lettersLeftArray.indexOf(letter)
    if (n !== -1) {
      lettersLeftArray.splice(n, 1)
    }
  }

  if (lettersLeftArray.length > 0) {
    return NOT_CONTAINED_MESSAGE(lettersLeftArray[0])
  }
  return false
}

export const unicodeSplit = (word: string) => {
  return new GraphemeSplitter().splitGraphemes(word)
}

export const unicodeLength = (word: string) => {
  return unicodeSplit(word).length
}

export const localeAwareLowerCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleLowerCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toLowerCase()
}

export const localeAwareUpperCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleUpperCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toUpperCase()
}

// January 1, 2022 Game Epoch
const epochMs = new Date(2022, 0).valueOf()
const msInDay = 86400000
const getIndex = () => {
  const now = Date.now()
  return Math.floor((now - epochMs) / msInDay) + getIndexOffset()
}

const getTomorrow = () => {
  return (getIndex() + 1) * msInDay + epochMs
}

export const getWordOfDay = () => {
  const index = getIndex()
  return {
    solution: localeAwareUpperCase(WORDS[index % WORDS.length]),
    solutionIndex: index,
  }
}

const MOLES = [
  'J',
  'X',
  'D',
  'H',
  'Q',
  'E',
  'Y',
  'T',
  'V',
  'K',
  'N',
  'A',
  'F',
  'R',
  'G',
  'I',
  'U',
  'Z',
  'M',
  'P',
  'L',
  'O',
  'W',
  'B',
  'S',
  'C',
]

export const { solution, solutionIndex } = getWordOfDay()
export const tomorrow = getTomorrow()

export const getMoleOfDay = () => {
  let index = getIndex()
  const splitSolution = unicodeSplit(solution)
  let mole = MOLES[index % MOLES.length]
  while (splitSolution.includes(mole)) {
    index += 1
    mole = MOLES[index % MOLES.length]
  }
  return mole
}

export const mole = getMoleOfDay()
