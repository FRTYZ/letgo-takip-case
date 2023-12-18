import { useState } from 'react'
import './App.css'

import { Container, Grid, Button, Box } from '@mui/material'

function App() {

  return (
    <Container>
      <Grid container spacing={3}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Box 
                sx={{ 
                  marginTop: '50px',
                  marginBottom: '150px'
                }}
            >
                <Button 
                    variant="contained"
                    sx={{
                        marginRight:'15px',
                        fontWeight: 300,
                        fontSize: '11px',
                        padding: '15px 41px 16px 41px',
                        backgroundColor: '#1C49D0'
                    }}
                  >
                    Add Stock
                </Button>
                <Button 
                    variant="contained"
                    sx={{
                        marginRight:'15px',
                        fontWeight: 300,
                        fontSize: '11px',
                        padding: '15px 41px 16px 41px',
                        backgroundColor: '#1C49D0'
                    }}
                  >
                    Refresh
                </Button>
            </Box>
          </Grid>
      </Grid>
      <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <h1>Charts Area</h1>
          </Grid>
      </Grid>
    </Container>
  )
}

export default App
