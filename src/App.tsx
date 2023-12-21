import { useEffect, useState } from 'react'
import './App.css'

import { 
    Container, 
    Grid, 
    Button, 
    Box,
    Modal,
    TextField,
    Card,
    CardContent,
    Typography
  } 
  from '@mui/material';

import { PieChart, Pie, Cell, Tooltip } from "recharts";

import { setCoinData, removeCoinBySymbol, updateCoinData } from './redux/store';
import { useSelector, useDispatch } from "react-redux";

function App() {
    const dispatch = useDispatch();

    const {coinData} = useSelector((state) => state.coinStorage);

    const [chartData, 
          setChartData] 
        = useState(
          [{
            name: 'default',
            value:1
          }]
        );
    
    const [open, setOpen] = useState<boolean>(false);
    const [getCoins, setGetCoins] = useState<string[] | object>([]);

    const [inputValue, setInputValue] = useState<string>('');
    const [searchCoins, setSearchCoins] = useState<string[] | object>([]);

    const [counts, setCounts] = useState<string[] | object>({});

    const handleModal = () => setOpen(!open);
    const handleCloseModal = () => {
        setOpen(false);
        location.reload()
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    useEffect(() => {
      if(coinData.length > 0){
        const newData = coinData.map(item => ({
          name: item.symbol,
          value: Number(item.count)
        }));

        setChartData(newData);
      }
    },[coinData])


    
    useEffect(() => {
        const getCoins = async() => {
            const url = 'https://api2.binance.com/api/v3/ticker/24hr';
            const response = await fetch(url);
            const results = await response.json();
            setGetCoins(results);
            
            if(Object.keys(counts).length != 0) {
                const result = {};
                coinData.forEach(item => {
                    const { symbol, count } = item;
                    result[symbol] = count
                })
                setCounts(result);
            }
        }
        getCoins();
    },[])

    useEffect(() => {
      if(inputValue){
        const searchCoin = async() => {
            const filteredCoins = getCoins.filter((coin) =>
                coin.symbol.toLowerCase().includes(inputValue.toLowerCase())
            );
            
            setSearchCoins(filteredCoins);
            
            if(filteredCoins.length > 0 && coinData.length > 0){
                filteredCoins.map((filterItem) => {
                    coinData.map((coinItem) => {
                        if(filterItem.symbol === coinItem.symbol){
                            filterItem['has_coin'] = true;
                            filterItem['count'] = coinItem.count;
                            setSearchCoins((prev) => [...prev]);
                        }
                     
                    })
                })
            }

        }
        searchCoin();
      }
    }, [inputValue, coinData]);


    /*
      iki tane parametre alır
      biri sembolün ismi ve value olan o anki count değeri temsil eder.
      sembol ismi alıp ve count değerini useState içinde tutar. bi sonraki değeri üstüne yazar
    */
    const handleCountChange = (symbol: string, value: string) => {
        const valueRegex = /^[0-9]+$/;
        const valueCheck = valueRegex.test(value);
        
        // eğer sadece pozitif sayı ise yazdırır 
        if(valueCheck){
            setCounts(prevCounts => ({
              ...prevCounts,
              [symbol]: Number(value),
            }));
        }
        else{
            // koşul sağlanmadığında default değer belirledik
            setCounts(prevCounts => ({
              ...prevCounts,
              [symbol]: 1,
            }));
        }
    };

    /* 
      Modalda aranan coin için add butonuna basınca alıncak aksiyonu belirler
      tek bi parametre alır. dizi içinde dönen sembollerin tıklanınılan sembolün ismini alır.
      bu ism ise counts state'inde arayıp count değerini alır
    */
    const handleAddCoin = (symbol: string) => {
        const count = counts[symbol] ? counts[symbol] : 1;
  
        let filteredCoin = searchCoins.find((coin) =>
            coin.symbol.includes(symbol)
        );
        
        if(filteredCoin){
            filteredCoin['count'] = Number(count);
            dispatch(setCoinData(filteredCoin)) 
        }
    };

    const handleRemoveCoin = (symbolName: string) => {
        const symbol = symbolName;
        dispatch(removeCoinBySymbol(symbol)) 
    }

    const handleUpdateCoin = (symbolName: string) => {
        const symbol: string = symbolName;

        const value: number = counts[symbol]

        const updateData: {
            symbol: string,
            data: object
        } = {
            symbol: symbol,
            data: {
              count: Number(value),
            }
        };

        dispatch(updateCoinData(updateData));
    }

    const handleRefresh = async() => {
      const url = 'https://api2.binance.com/api/v3/ticker/24hr';
      const response = await fetch(url);
      const results = await response.json();

      coinData.length > 0 && coinData.map(( item: string ) => {
          const filteredCurrentCoin = results.find((coin: string) =>
              coin.symbol.includes(item.symbol)
          );

          const newData: {
              symbol: string,
              data: object
          } = {
              "symbol": item.symbol,
              data: {
                "weightedAvgPrice": filteredCurrentCoin.weightedAvgPrice,
                "lastPrice": filteredCurrentCoin.lastPrice
              }           
          }
          dispatch(updateCoinData(newData));
      })
      location.reload();
    }

    useEffect(() => {
        const invervalCoin = setInterval(() => {
          handleRefresh();
        }, 5 * 60 * 1000);

        return () => clearInterval(invervalCoin);
    }, [])


    const COLORS = ["#b8c0c7", "#00C49F", "#FFBB28", "#FF8042"];
    
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

    
    return (
      <Container
        maxWidth='xl'
      >
        <Grid container spacing={3}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Box 
                  sx={{ 
                    marginTop: '50px',
                    marginBottom: '80px',
                    textAlign: { lg: 'left' ,md: 'left' ,sm: 'center', xs: 'center' }
                  }}
              >
                  <Button 
                      variant="contained"
                      onClick={handleModal}
                      sx={{
                          marginRight:'35px',
                          fontWeight: 300,
                          fontSize: '11px',
                          padding: '15px 41px 16px 41px',
                          backgroundColor: '#1C49D0',
                          textTransform: 'none'
                      }}
                    > 
                      {coinData.length > 0 ? 'Add / Update' : 'Add Stock'}
                  </Button>
                  <Button 
                      variant="contained"
                      sx={{
                          marginRight:'15px',
                          fontWeight: 300,
                          fontSize: '11px',
                          padding: '15px 41px 16px 41px',
                          backgroundColor: '#1C49D0',
                          textTransform: 'none'
                      }}
                      onClick={() => handleRefresh()}
                    >
                      Refresh
                  </Button>
              </Box>
            </Grid>
            <Modal
                open={open}
                onClose={handleCloseModal}
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
                      overflow: 'scroll',
                      display: 'block',
                      height: '80%',
                      p: 4,
                }}>
                    <Grid container spacing={3}>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginBottom: '40px' }}>
                              <TextField
                                  fullWidth
                                  size='small'
                                  id="search"
                                  name="search"
                                  placeholder='Search'
                                  onChange={handleInputChange}
                              />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        {searchCoins.length > 0 && searchCoins.map((item, key) => (
                          <Card 
                              sx={{
                                  minWidth: 275,
                                  boxShadow: '0 1px 3px 0 rgba(0,47,52,.2), 0 1px 3px 0 rgba(0,47,52,.2)',
                                  borderLeft: '4px solid #004bbe',
                                  marginBottom: '20px',
                                  paddingTop: '20px'
                                  
                              }}
                              key={key}
                          >
                            <CardContent>
                                <Grid container spacing={4} key={key} sx={{ marginBottom: '20px' }}>
                                    <Grid item lg={7} md={7} sm={7} xs={7}>
                                          <TextField
                                              fullWidth
                                              size='small'
                                              id="sembolName"
                                              name="sembolName"
                                              className='searchCoinSembolName'
                                              value={`${item.symbol} - ${item.lastPrice}`}
                                              InputProps={{
                                                  readOnly: true,
                                              }}
                                              variant='standard'
                                              sx={{ 
                                                    paddingTop: '8px'
                                                }}
                                          />
                                    </Grid>
                                    <Grid item lg={2} md={2} sm={2} xs={2}>
                                         <TextField
                                              id="outlined-number"
                                              type="number"
                                              defaultValue={item.has_coin ? item.count : 1}
                                              InputLabelProps={{
                                                shrink: true
                                              }}
                                              InputProps={{
                                                inputProps: { 
                                                    max: 100, min: 1
                                                },
                                              }}
                                              size='small'
                                              value={counts[item.symbol]}
                                              onChange={(e) => handleCountChange(item.symbol, e.target.value)}
                                          />
                                    </Grid>
                                    <Grid item lg={3} md={3} sm={3} xs={3} sx={{ display: 'grid' }}>
                                        {item.has_coin ? (
                                           <Box sx={{ float: 'right', marginTop:'5px' }}>
                                              <Button 
                                                      variant="contained" 
                                                      type='submit'
                                                      sx={{
                                                          backgroundColor: '#17A948',
                                                          color: '#ffffff',
                                                          marginRight: '5px',
                                                          textTransform: 'none',
                                                          fontWeight: 400,
                                                          fontSize: '12px',
                                                          padding: '5px 15px 5px 15px',
                                                          '&:hover': {backgroundColor: '#17A948'}
                                                      }}
                                                      size="small"
                                                      onClick={() => handleUpdateCoin(item.symbol, )}
                                                  >
                                                  update
                                              </Button>
                                              <Button 
                                                      variant="contained" 
                                                      type='submit'
                                                      sx={{
                                                        backgroundColor: '#C12126',
                                                        color: '#ffffff',
                                                        fontWeight: 400,
                                                        textTransform: 'none',
                                                        fontSize: '12px',
                                                        padding: '5px 15px 5px 15px',
                                                        '&:hover': {backgroundColor: '#C12126'}
                                                      }}
                                                      size="small"
                                                      onClick={() => handleRemoveCoin(item.symbol)}
                                                  >
                                                  remove
                                              </Button>
                                          </Box>
                                        ): (
                                          <Button 
                                              variant="contained" 
                                              type='submit'
                                              sx={{
                                                backgroundColor: '#1C49D0',
                                                color: '#ffffff',
                                                textTransform: 'none',
                                                fontWeight: 400,
                                                fontSize: '12px',
                                                padding: '5px 15px 5px 15px',
                                              }}
                                              size="large"
                                              onClick={() => handleAddCoin(item.symbol)}
                                          >
                                            Add
                                          </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                          </Card>
                          ))}
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xl={8} lg={8} md={12} sm={12}>
              {coinData.length > 0 && coinData.map((item,key) => (
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12} key={key}>
                    <Card 
                      sx={{
                          minWidth: 275,
                          boxShadow: '0 1px 3px 0 rgba(0,47,52,.2), 0 1px 3px 0 rgba(0,47,52,.2)',
                          borderLeft: '4px solid #004bbe',
                          marginBottom: '20px',
                          paddingBottom: 0
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
                              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                  <Typography variant="h6" component="div">
                                        {item.symbol}
                                  </Typography>
                                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        {item.lastPrice}  - {item.weightedAvgPrice}
                                  </Typography>
                              </Grid>
                              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                <form>
                                    <Grid container>
                                        <Grid item xl={4} lg={4} md={4} sm={2} xs={2}>
                                            <Box sx={{ marginTop: '15px' }}>
                                              <TextField
                                                  id="outlined-number"
                                                  type="number"
                                                  defaultValue={item.count}
                                                  InputLabelProps={{
                                                    shrink: true
                                                  }}
                                                  InputProps={{
                                                    inputProps: { 
                                                        max: 100, min: 1
                                                    },
                                                  }}
                                                  size='small'
                                                  value={counts[item.symbol]}
                                                  onChange={(e) => handleCountChange(item.symbol, e.target.value)}
                                              />
                                            </Box>
                                        </Grid>
                                        <Grid item xl={8} lg={8} md={8} sm={10} xs={10}>
                                          <Box sx={{ float: 'right', marginTop:'16px' }}>
                                              <Button 
                                                      variant="contained" 
                                                      type='submit'
                                                      sx={{
                                                          backgroundColor: '#17A948',
                                                          color: '#ffffff',
                                                          marginRight: '5px',
                                                          textTransform: 'none',
                                                          fontWeight: 400,
                                                          fontSize: '12px',
                                                          padding: '5px 15px 5px 15px',
                                                          '&:hover': {backgroundColor: '#17A948'}
                                                      }}
                                                      size="small"
                                                      onClick={() => handleUpdateCoin(item.symbol, )}
                                                  >
                                                  update
                                              </Button>
                                              <Button 
                                                      variant="contained" 
                                                      type='submit'
                                                      sx={{
                                                        backgroundColor: '#C12126',
                                                        color: '#ffffff',
                                                        fontWeight: 400,
                                                        textTransform: 'none',
                                                        fontSize: '12px',
                                                        padding: '5px 15px 5px 15px',
                                                        '&:hover': {backgroundColor: '#C12126'}
                                                      }}
                                                      size="small"
                                                      onClick={() => handleRemoveCoin(item.symbol)}
                                                  >
                                                  remove
                                              </Button>
                                          </Box>
                                        </Grid>
                                    </Grid>
                                  </form>
                              </Grid>
                          </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
            <Grid item xl={4} lg={4} md={12} sm={12}>
              <PieChart width={600} height={900} className='letgo-charts-div'>
                  <Pie
                    data={chartData}
                    cx={200}
                    cy={200}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={200}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.length > 0 && chartData.map((entry, index) => (
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
