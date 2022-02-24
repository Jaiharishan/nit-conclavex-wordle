import { GameStats } from '../../lib/localStorage'
import LoginBaseModal from './LoginBaseModel'
import Login from '../buttons/Login'

type Props = {
  isOpen: boolean
  handleClose: () => void
  gameStats: GameStats
  isUser: boolean
}

export const LoginModel = ({ isOpen, handleClose, isUser }: Props) => {
  return (
    <LoginBaseModal
      title={'LOGIN TO PLAY THE GAME'}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <Login />
    </LoginBaseModal>
  )
}
