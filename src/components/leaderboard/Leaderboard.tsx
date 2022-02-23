import { DataGrid, GridColDef } from '@mui/x-data-grid'
import ContentAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline'
import { useEffect, useState } from 'react'
import { BACKEND_URL } from '../../constants/strings'

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Rank', width: 80 },
  { field: 'name', headerName: 'Name', width: 100 },
  {
    field: 'score',
    headerName: 'Score',
    type: 'number',
    width: 100,
  },
]

const tmp = [{ id: 1, name: 'Jon', score: 35 }]

export const Leaderboard = () => {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch(BACKEND_URL + '/users')
      .then(async (res) => {
        //console.log(await res.json())
        const users: any = Object.entries(await res.json())[1][1]
        users.sort((a: any, b: any) => (a.score > b.score ? -1 : 1))
        users.forEach((user: any, index: any) => {
          user.id = index + 1;
        })
        setData(users)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])
  return (
    <div
      style={{
        height: 400,
        width: '100%',
        color: 'white',
        backgroundColor: '#FFF',
      }}
    >
      <DataGrid
        rows={!data ? tmp : data}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  )
}
