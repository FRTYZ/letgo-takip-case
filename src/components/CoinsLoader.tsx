import React from 'react';

import { 
    Grid, 
    Box,
    Card,
    CardContent,
  } 
  from '@mui/material';
const CoinsLoader = () => {

  return (
    <>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Card 
                sx={{
                    minWidth: 275,
                    boxShadow: '0 1px 3px 0 rgba(0,47,52,.2), 0 1px 3px 0 rgba(0,47,52,.2)',
                    marginBottom: '20px',
                    padding: 4,
                    backgroundColor: '#ddd9d9'
                }}
            >
            <CardContent sx={{ 
                    padding: {
                        lg: '15px 20px 10px 20px !important', 
                        xl: '15px 20px 10px 20px !important', 
                        md: '15px 20px 10px 20px !important', 
                        xs:'20px 20px 20px 20px !important' }, 
                        
                    }}>
                <Grid container spacing={1}>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12}></Grid>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                        <Grid container>
                            <Grid item xl={6} lg={6} md={6} sm={2} xs={2}>
                                <Box></Box>
                            </Grid>
                            <Grid item xl={6} lg={6} md={6} sm={10} xs={10}></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
            </Card>
        </Grid>
    </>
  )
}

export default CoinsLoader