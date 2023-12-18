import { useEffect, useState } from 'react'
import './App.css'

import { 
    Container, 
    Grid, 
    Button, 
    Box,
    Modal,
    TextField
  } 
  from '@mui/material';

import { PieChart, Pie, Cell, Tooltip } from "recharts";

import { useFormik } from 'formik';
import { setCoinData } from './redux/store';
import { useSelector, useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();

  const {coinData} = useSelector((state) => state.coinStorage);

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
  const [getCoins, setGetCoins] = useState([]);
  const [searchCoins, setSearchCoins] = useState([]);

  const handleModal = () => {
    setOpen(!open)
  }

  const formik = useFormik({
      initialValues: {
          search: '',
          sembolName: '',
          sembolCount: 1,
      },
      onSubmit: async (values) => {
          const {sembolName, sembolCount} = values;

          const selectedCoin = sembolName;
          const filteredCoin = searchCoins.filter((coin) =>
              coin.symbol.toLowerCase().includes(selectedCoin.toLowerCase())
          );
          dispatch(setCoinData(filteredCoin))
      }
  })

  useEffect(() => {
      const getCoins = async() => {
          const url = 'https://api2.binance.com/api/v3/ticker/24hr';
          const response = await fetch(url);
          const results = await response.json();
          setGetCoins(results);
      }
      getCoins();
  },[])


  useEffect(() => {
    if(formik.values.search){
      const searchCoin = async() => {
          const currentSearch = formik.values.search;
          const filteredCoins = getCoins.filter((coin) =>
              coin.symbol.toLowerCase().includes(currentSearch.toLowerCase())
          );

          setSearchCoins(filteredCoins);

      }
      searchCoin();
    }
  }, [formik.values.search]);
 
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
          <Modal
              open={open}
              onClose={handleModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xl: '800px', lg: '800px', md: '95%', sm: '95%', xs: '95%'  },
                  bgcolor: 'background.paper',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4,
              }}>
                <form
                    method='POST'
                    onSubmit={formik.handleSubmit}
                >
                  <Grid container spacing={3}>
                    <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginBottom: '40px' }}>
                          <TextField
                              fullWidth
                              size='small'
                              id="search"
                              name="search"
                              placeholder='Search'
                              value={formik.values.search}
                              onChange={formik.handleChange}
                          />
                    </Grid>
                  </Grid>
                  {searchCoins.length > 0 && searchCoins.map((item, key) => (
                      <Grid container spacing={3} key={key} sx={{ marginBottom: '20px' }}>
                        <Grid item lg={6} md={6} sm={6} xs={6}>
                              <TextField
                                  fullWidth
                                  size='small'
                                  id="sembolName"
                                  name="sembolName"
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                  value={item.symbol}
                                  onChange={formik.handleChange}
                              />
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3}>
                                <TextField
                                  fullWidth
                                  type='number'
                                  size='small'
                                  id="sembolCount"
                                  name="sembolCount"
                                  defaultValue={1}
                                  value={formik.values.sembolCount}
                                  onChange={formik.handleChange}
                              />
                        </Grid>
                        <Grid item lg={3} md={3} sm={3} xs={3} sx={{ display: 'grid' }}>
                            <Button 
                                variant="contained" 
                                type='submit'
                                sx={{
                                  backgroundColor: '#1C49D0',
                                  color: '#ffffff',
                                }}
                                size="large"
                              >Add
                            </Button>
                        </Grid>
                      </Grid>
                  ))}
               </form>
            </Box>
          </Modal>
      </Grid>
    </Container>
  )
}

export default App
