import { DataGrid, GridColDef } from '@mui/x-data-grid'

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

const rows = [
  { id: 1, name: 'Jon', score: 35 },
  { id: 2, name: 'Cersei', score: 42 },
  { id: 3, name: 'Jaime', score: 45 },
  { id: 4, name: 'Arya', score: 16 },
  { id: 5, name: 'Daenerys', score: 29 },
  { id: 6, name: 'Akash', score: 150 },
  { id: 7, name: 'Ferrara', score: 44 },
  { id: 8, name: 'Rossini', score: 36 },
  { id: 9, name: 'Harvey', score: 65 },
]

export const Leaderboard = () => {
  return (
    <div style={{ height: 400, width: '100%', color: 'white', backgroundColor: '#2563EB' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  )
}
