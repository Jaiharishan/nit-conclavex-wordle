import {
  InformationCircleIcon,
  ChartBarIcon,
  ChartPieIcon,
  CogIcon,
} from '@heroicons/react/outline'
import { useState, useEffect } from 'react'
import 'react-tabs/style/react-tabs.css'
import { LeaderboardModel } from './components/modals/LeaderboardModal'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { currentUserEmail } from './components/buttons/Login'
import {
  GAME_TITLE,
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  BACKEND_URL,
} from './constants/strings'
import LoginBaseModal from './components/modals/LoginBaseModel'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  ALERT_TIME_MS,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  findFirstUnusedReveal,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import './App.css'
import Login from './components/buttons/Login'
import { LoginModel } from './components/modals/loginModal'
// import { useState } from 'react'
import GoogleLogin from 'react-google-login'

function App() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const [isUser, setIsUser] = useState(false)

  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isHardModeAlertOpen, setIsHardModeAlertOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [successAlert, setSuccessAlert] = useState('')
  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.solution !== solution) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(solution)
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )

  const [isMissingPreviousLetters, setIsMissingPreviousLetters] =
    useState(false)
  const [missingLetterMessage, setIsMissingLetterMessage] = useState('')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      setIsHardModeAlertOpen(true)
      return setTimeout(() => {
        setIsHardModeAlertOpen(false)
      }, ALERT_TIME_MS)
    }
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution })
  }, [guesses])

  async function updateUserScore() {
    //GET Current user score
    let currentScore = 0
    let currentName = ''
    let currentId = ''

    fetch(BACKEND_URL + '/users')
      .then(async (res) => {
        const users: any = Object.entries(await res.json())[1][1]
        const result = users.find(
          ({ email }: { email: any }) => email === currentUserEmail
        )
        //console.log(result.score)
        currentScore = result.score
        currentName = result.name
        currentId = result.id
        let data = {
          id: currentId,
          name: currentName,
          email: currentUserEmail,
          score: currentScore + 10,
        }

        fetch(BACKEND_URL + '/updateUser', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          console.log('Request complete! PUT postUser', res)
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    if (isGameWon) {
      updateUserScore()

      setTimeout(() => {
        setSuccessAlert(
          WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
        )

        setTimeout(() => {
          setSuccessAlert('')
          setIsStatsModalOpen(true)
        }, ALERT_TIME_MS)
      }, REVEAL_TIME_MS * MAX_WORD_LENGTH)
    }
    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost])

  const onChar = (value: string) => {
    if (
      currentGuess.length < MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }
    if (!(currentGuess.length === MAX_WORD_LENGTH)) {
      setIsNotEnoughLetters(true)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    if (!isWordInWordList(currentGuess)) {
      setIsWordNotFoundAlertOpen(true)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses)
      if (firstMissingReveal) {
        setIsMissingLetterMessage(firstMissingReveal)
        setIsMissingPreviousLetters(true)
        setCurrentRowClass('jiggle')
        return setTimeout(() => {
          setIsMissingPreviousLetters(false)
          setCurrentRowClass('')
        }, ALERT_TIME_MS)
      }
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

    const winningWord = isWinningWord(currentGuess)

    if (
      currentGuess.length === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
      }
    }
  }

  const [user, setUser]: any = useState({})

  let currentUserEmail = ''
  const onSuccess = (res: any) => {
    // send the response to a backend using axios and get that creds store in a database and display in leaderboard
    let data = {
      id: res.profileObj.googleId,
      name: res.profileObj.name,
      email: res.profileObj.email,
      score: 0,
    }

    setUser(data)
    setIsUser(true)
    currentUserEmail = res.profileObj.email

    fetch(BACKEND_URL + '/postUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log('Request complete! response:', res)
    })
  }
  const clientId =
    '428218354441-bbovvr4fia9t9v7obe75c6kp7hils1nb.apps.googleusercontent.com'

  const handleLoginClose = () => {
    if (isUser) {
      setIsLoginModalOpen(false)
    }
  }

  return (
    <div className="mt-20 pb-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div className="flex fixed top-0 left-0 w-full px-2 md:px-4 items-center justify-between -z-10">
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center">
          <img src="./nitt.png" alt="NITT-LOGO" />
        </div>
        <div className="w-24 h-24 md:w-28 md:h-28 flex items-center">
          <img src="./conclave.png" alt="CONCALVE-LOGO" />
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center">
          <img src="./tc.png" alt="TC-LOGO" />
        </div>
        <div className="w-24 h-24 md:h-28 md:w-28 flex items-center">
          <img src="./prgyan.png" alt="PRGYAN-LOGO" />
        </div>
      </div>
      <div className="flex w-80 mx-auto items-center mb-8 mt-20">
        <h1 className="text-xl ml-2.5 grow font-bold dark:text-white">
          {GAME_TITLE}
        </h1>
        <InformationCircleIcon
          className="h-7 w-7 mr-2 cursor-pointer dark:stroke-white"
          onClick={() => setIsInfoModalOpen(true)}
        />
        <ChartPieIcon
          className="h-7 w-7 mr-2 cursor-pointer dark:stroke-white"
          onClick={() => setIsStatsModalOpen(true)}
        />
        <ChartBarIcon
          className="h-7 w-7 mr-2 cursor-pointer dark:stroke-white"
          onClick={() => setIsLeaderboardModalOpen(true)}
        />
        <CogIcon
          className="h-7 w-7 mr-2 cursor-pointer dark:stroke-white"
          onClick={() => setIsSettingsModalOpen(true)}
        />
      </div>
      <Grid
        guesses={guesses}
        currentGuess={currentGuess}
        isRevealing={isRevealing}
        currentRowClassName={currentRowClass}
      />
      <Keyboard
        onChar={onChar}
        onDelete={onDelete}
        onEnter={onEnter}
        guesses={guesses}
        isRevealing={isRevealing}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <LeaderboardModel
        isOpen={isLeaderboardModalOpen}
        handleClose={() => setIsLeaderboardModalOpen(false)}
        gameStats={stats}
      />
      {/* <LoginModel
        isOpen={isLoginModalOpen}
        handleClose={() => setIsLoginModalOpen(false)}
        gameStats={stats}
        isUser={false}
      /> */}
      <LoginBaseModal
        title={'LOGIN TO PLAY THE GAME'}
        isOpen={isLoginModalOpen}
        handleClose={handleLoginClose}
      >
        <div className="flex w-100 mt-10 items-center justify-center">
          {/* <button>Login with google</button> */}
          {user?.email ? (
            <p className="text-xl font-bold dark:text-white">Hi! {user.name}</p>
          ) : (
            <GoogleLogin
              clientId={clientId}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="dark:bg-white shadow-lg px-3 py-3 rounded-lg flex gap-1 items-center hover:scale-105 transition duration-150"
                >
                  <img
                    src="https://img.icons8.com/color/50/000000/google-logo.png"
                    alt="google-icon"
                    className="w-8 h-8 md:w-10 md:h-10"
                  />

                  <p className="md:text-lg">Login with Google</p>
                </button>
              )}
              buttonText="Login with Google"
              onSuccess={onSuccess}
              onFailure={(res) => console.log(res)}
              cookiePolicy={'single_host_origin'}
            />
          )}
        </div>
      </LoginBaseModal>
      <StatsModal
        isOpen={isStatsModalOpen}
        handleClose={() => setIsStatsModalOpen(false)}
        guesses={guesses}
        gameStats={stats}
        isGameLost={isGameLost}
        isGameWon={isGameWon}
        handleShare={() => {
          setSuccessAlert(GAME_COPIED_MESSAGE)
          return setTimeout(() => setSuccessAlert(''), ALERT_TIME_MS)
        }}
        isHardMode={isHardMode}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        handleClose={() => setIsSettingsModalOpen(false)}
        isHardMode={isHardMode}
        handleHardMode={handleHardMode}
        isDarkMode={isDarkMode}
        handleDarkMode={handleDarkMode}
        isHardModeErrorModalOpen={isHardModeAlertOpen}
        isHighContrastMode={isHighContrastMode}
        handleHighContrastMode={handleHighContrastMode}
      />

      <Alert message={NOT_ENOUGH_LETTERS_MESSAGE} isOpen={isNotEnoughLetters} />
      <Alert
        message={WORD_NOT_FOUND_MESSAGE}
        isOpen={isWordNotFoundAlertOpen}
      />
      <Alert message={missingLetterMessage} isOpen={isMissingPreviousLetters} />
      <Alert
        message={CORRECT_WORD_MESSAGE(solution)}
        isOpen={isGameLost && !isRevealing}
      />
      <Alert
        message={successAlert}
        isOpen={successAlert !== ''}
        variant="success"
        topMost={true}
      />
      {/* <Login /> */}
    </div>
  )
}

export default App
