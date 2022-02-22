import { GameStats } from '../../lib/localStorage'
import { BaseModal } from './BaseModal'
import { StatBar } from '../stats/StatBar'
import { Leaderboard } from '../leaderboard/Leaderboard'
import {
  STATISTICS_TITLE,
} from '../../constants/strings'

type Props = {
  isOpen: boolean
  handleClose: () => void
  gameStats: GameStats
}

export const LeaderboardModel = ({
  isOpen,
  handleClose,
  gameStats,
}: Props) => {
  if (gameStats.totalGames <= 0) {
    return (
      <BaseModal
        title={STATISTICS_TITLE}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <StatBar gameStats={gameStats} />
      </BaseModal>
    )
  }
  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <Leaderboard />
    </BaseModal>
  )
}