import { GameStats } from '../../lib/localStorage'
import { BaseModal } from './BaseModal'
import { Leaderboard } from '../leaderboard/Leaderboard'
import {
  LEADERBOARD_TITLE,
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
  return (
    <BaseModal
      title={LEADERBOARD_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <Leaderboard />
    </BaseModal>
  )
}