import { useState } from 'react'
import './App.css'

import { 
    Container, 
    Grid, 
    Button, 
    Box,
    Modal
  } 
  from '@mui/material';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function App() {

  const data = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 }
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const [open, setOpen] = useState(false);

  const handleModal = () => {
    setOpen(!open)
  }

  return (
    <Container>
      <Grid container spacing={3}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Box 
                sx={{ 
                  marginTop: '50px',
                  marginBottom: '150px',
                  textAlign: { lg: 'left' ,md: 'left' ,sm: 'center', xs: 'center' }
                }}
            >
                <Button 
                    variant="contained"
                    onClick={handleModal}
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
          <Grid item xl={12} lg={12} md={12} sm={12}>
            <PieChart width={600} height={900} className='letgo-charts-div'>
                <Pie
                  data={data}
                  cx={200}
                  cy={200}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={200}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
            </PieChart>
          </Grid>
      </Grid>
    </Container>
  )
}

export default App
