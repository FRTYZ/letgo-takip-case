import { useEffect, useState, lazy, Suspense, useRef } from 'react'
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

import { updateCoinData } from './redux/store';
import { useSelector, useDispatch } from "react-redux";

import CoinsLoader from './components/CoinsLoader';
const Coins = lazy(() => import('./components/Coins'));

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
    const [getCoins, setGetCoins] = useState<object[]>([]);

    const [inputValue, setInputValue] = useState<string>('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [searchCoins, setSearchCoins] = useState<object[]>([]);
    const targetRef = useRef<HTMLDivElement>(null);

    /*
        -Binance'ten güncel api verilerini alır.

        -Kullanıcının reduxta kaydettiği portföylerin sembol ve count isimlerini alır
        bununla ise counts adındaki state yazar
    */
    useEffect(() => {
        const getCoins = async() => {
            const url = 'https://api2.binance.com/api/v3/ticker/24hr';
            const response = await fetch(url);
            const results = await response.json();

            setGetCoins(results);
        }

        getCoins();
    },[])

    /*
        Reduxta tutulan portfoylerin name ve sembol isimlerini alıp
        Chartın istediği obje şeklinde charta gönderir      
    */
    useEffect(() => {
        if(coinData.length > 0){
            const newData = coinData.map(item => ({
              name: item.symbol,
              value: Number(item.count)
            }));

            setChartData(newData);
        }
    },[coinData])


    /*
      -search inputunda data gelince çalışıyor

      -api den gelen verleri tuttuğumuz getCoins state tutuluyor
      bu objeler içinde arama yapıp searchCoins state yazar ve kullanıcı önüne sunar

      -kullanıcı portföyünde kayıtlı olan coinler varsa ilgili objelere has_coin ve reduxtan gelen
      count verisini searchCoins state'ine yazar
    */

    useEffect(() => {
        if(inputValue){
              const searchCoin = async() => {
                    const filteredSearchCoins = getCoins.filter((coin) =>
                        coin.symbol.toLowerCase().includes(inputValue.toLowerCase())
                    );

                    const updatedSearchCoins = filteredSearchCoins.map(searchCoin => {
                    const localCoin = coinData.find(localCoin => localCoin.symbol === searchCoin.symbol);

                    if (localCoin && localCoin !== 'undefined') {
                        // Eğer eşleşen sembol varsa count değerini ekleyerek güncelle
                        return { ...searchCoin, count: localCoin.count, has_in_redux: true };
                    }  
                        return { ...searchCoin, count: 1, has_in_redux: false };
                    });
                    setSearchCoins(updatedSearchCoins);
              }

              searchCoin();
        }

    }, [inputValue, targetRef?.current]);


    // 5dk bir güncelleme sağlıyor
    useEffect(() => {
        const invervalCoin = setInterval(() => {
          handleRefresh();

        }, 5 * 60 * 1000);

        return () => clearInterval(invervalCoin);
    }, [])


    // Modal açılıp / kapanmasını sağlar
    const handleModal = () => setOpen(!open);

    //  Modal'daki search butonu için anlık olarak yazılan verisini alıp inputValue içinde yazar
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if(typingTimeout){
          clearTimeout(typingTimeout);
        }

        setTypingTimeout(setTimeout(() => {
          setInputValue(inputValue);
        }, 1000) as any);

    };

    /*
        -handleRefresh fonksiyon ise, sayfada en üstte bulunan refresh butonu içindir.

        -bu fonksiyon binance'teki api istek atıp güncel olan değerleri alıp, 
        ardından sembol ismiyle ve yeni değerleri reduxa gönderip güncelleniyor.
    */
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
    }

    //Chart ayarları
    const COLORS = ["#b8c0c7", "#00C49F", "#FFBB28", "#FF8042"];
    const RADIAN = Math.PI / 180;
    
    /* 
        Chart içinde olan her dilimi temsil eder

        Parametreleri
        -cx, cy : Dairenin merkezinin x ve y koordinatları.
        -midAngle: Dilimin merkez açısı.
        -innerRadius: İç yarıçap.
        -outerRadius: Dış yarıçap.
        -percent: Dilimin yüzdesi.
        -index: Dilimin indeksi.
    */
    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}: any) => {
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
                  onClose={handleModal}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
              >
                <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { xl: '800px', lg: '800px', md: '95%', sm: '95%', xs: '95%' },
                      bgcolor: 'background.paper',
                      border: '2px solid #000',
                      boxShadow: 24,
                      overflow: 'scroll',
                      display: 'block',
                      height: '80%',
                      p: 4,
                  }}
                >
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
                          <Suspense fallback={<CoinsLoader />}>
                              <Coins data={searchCoins} searchCoin={true} targetRef={targetRef} />
                          </Suspense>
                      </Grid>
                  </Grid>

                  <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                          <div ref={targetRef}>
                              {/* Intersection Observer'ın gözlemlediği gizli bir hedef element */}
                          </div>
                      </Grid>
                  </Grid>
                </Box>
              </Modal>
          </Grid>
          <Grid container spacing={3}>
              <Grid item xl={8} lg={8} md={12} sm={12}>
                  <Suspense fallback={<CoinsLoader />}>
                        {coinData && <Coins data={coinData} searchCoin={false} targetRef={targetRef} /> }
                    </Suspense>
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
