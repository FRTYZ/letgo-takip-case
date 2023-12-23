import React, {useState, useEffect} from 'react';

import { 
    Grid, 
    Button, 
    Box,
    TextField,
    Card,
    CardContent,
    Typography
  } 
  from '@mui/material';

import { setCoinData, removeCoinBySymbol, updateCoinData } from '../redux/store';
import { useSelector, useDispatch } from "react-redux";

interface CoinsAreaProps {
    data: object[],
    searchCoin: boolean,
    targetRef: React.RefObject<HTMLDivElement>;
}

const Coins: React.FC<CoinsAreaProps> = ({ data, searchCoin, targetRef }) => {
    const dispatch = useDispatch();
    const {coinData} = useSelector((state) => state.coinStorage);

    //--------- UseState Area --------------

    const [coinsCardData, setCoinsCardData] = useState<object[]>([]);
    const [counts, setCounts] = useState<object>({});
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10; // Her sayfada gösterilecek öğe sayısı

    //--------- UseEffect Area --------------

    // Propstan gelen data veri geldiği zamanda çalışır
    useEffect(() => {

        // arama yaptığında ilk 10 verileri almasını sağlıyor
        if(searchCoin){
            setCoinsCardData(Array.isArray(data) ? data.slice(0, pageSize) : []);
        }
        else{
            // portföydeki verileri temsil eder.
            setCoinsCardData(data)
        } 

    },[data])

    /*
       -IntersectionObserver ile modalı takip edip, modal aşağıya indikçe sayfa numarası arttırır
       buradaki pageNumber alınıp, bi aşağıdaki useEffect'te kullanılıyor
    */
    useEffect(() => {      
        if(targetRef?.current && searchCoin){
            /* 
               Modalın sonunda görünür hale geldiğini isIntersecting ile true false değeri vermesi ile belirtir
               True olduğu durumda pageNumber sayısını arttırır
            */
            const handleIntersection: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setPageNumber((prev) => prev + 1)
                    }

                });
            };
            
            // modalı takip etmek için bazı ayarlar
            const options: IntersectionObserverInit = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5,
            };
            
            /*  modalı IntersectionObserver fonksiyonu ile takip edeceğiz
                işlemleri yönetmek için handleIntersection kullanılıyor.
            */
            const observer = new IntersectionObserver(handleIntersection, options);
        
            if (targetRef.current) {
                observer.observe(targetRef.current);
            }
        
            return () => {
                if (targetRef.current) {
                    observer.unobserve(targetRef.current);
                }
            };
        }
        
    }, [targetRef, data]);
  
    // bi üstteki useEffect ile arttırılan pageNumber takip eder 
    useEffect(() => {

        // arttırılan pageNumber alınıp bununla slice ile bölünüp verileri set eder.
        const fetchData = () => {
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const limitedData = data.length % pageSize ? data.slice(startIndex, endIndex) : data
           
            if(limitedData.length > 0){
                setCoinsCardData((prevData) => [ ...prevData, ...limitedData ]);
            }

        }

        // bu yapının modal açılıp arama yaptığında çalışmasını sağlar
        if(searchCoin){
            fetchData();
        }
        
      },[pageNumber])

    /*
        -Kullanıcının reduxta kaydettiği portföylerin sembol ve count isimlerini alır
        bununla ise counts adındaki state yazar
    */
    useEffect(() => {
        const getCurrentCoinCounts = () => {
            if(coinData.length > 0) {
                const result = {};

                coinData.forEach(item => {
                    const { symbol, count } = item;
                    result[symbol] = count
                })

                /* kullanıcı önceden count değiştirdiği coin varsa onlarla beraber
                    reduxtaki count verilerle günceller
                */
                setCounts(prevCounts => ({
                    ...prevCounts, ...result
                }))

            }
        }

        getCurrentCoinCounts();

    },[coinData])

    //--------- Function Area --------------

    /*
        -iki tane parametre alır
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
        -Modalda aranan coin için add butonuna basınca alıncak aksiyonu belirler

        -symbol isminde tek bi parametre alır. 
        
        -searchCoins state'te tutulan dizi içinde coinlerin, kullanıcının tıklanınılan sembolün ismini alır.
        bu ism ise counts state'inde arayıp count değerini alır
    */
    const handleAddCoin = (symbolName: string) => {
        const count: number = Object.keys(counts).includes(symbolName) ? counts[symbolName] : 1

        interface filteredCoinTypes {
            symbol: string,
            count: number,
            has_in_redux: boolean
        }

        type FilteredCoinDefine = Partial<filteredCoinTypes>

        const filteredCoin = data.find((coin) => (
            coin?.symbol.includes(symbolName)

        )) as FilteredCoinDefine;

        if(filteredCoin){
            const filteredCoinTwin: FilteredCoinDefine = { ...filteredCoin }

            filteredCoinTwin['count'] = Number(count)
           
            if(searchCoin){
                filteredCoinTwin['has_in_redux'] = true
            }
           
            dispatch(setCoinData(filteredCoinTwin)) 

            setCoinsCardData(prevObjects => {

                return prevObjects.map(obj => {
                  if (obj?.symbol === symbolName) {
                    return { ...obj, has_in_redux: true, count: Number(count)  }
                  }
                  return obj;
                })
            })

        }
    };

    /*
        Bir tane string türünde sembol ismi için parametre alır,
        sembol ismini alıp redux'ta sembol ismini gönderip siliyoruz
    */
    const handleRemoveCoin = (symbolName: string) => {
        const symbol = symbolName;

        dispatch(removeCoinBySymbol(symbol));
            
        if(searchCoin){
            const updateData: {
                symbol: string,
                data: object
            } = {
                symbol: symbol,
                data: {
                    count:0,
                    has_in_redux: false
                }
            };

            dispatch(updateCoinData(updateData));

            setCounts(prevCounts => ({
                ...prevCounts,
                [symbol]: 1,
            }));

            setCoinsCardData(prevObjects => {
                return prevObjects.map(obj => {
                  if (obj.symbol === symbol) {
                    return { ...obj, has_in_redux: false, count: 1 }
                  }

                  return obj;
                })
            })
            
        }
    }

    /*
        -Bir tane string türünde sembol ismi için parametre alır
        -aldığı parametre ve count değeri ile yeni bi obje gönderip, ilgili sembolun bulunduğu objeyi günceller
    */
    const handleUpdateCoin = (symbolName: string) => {
        const symbol: string = symbolName;
        const value: number = counts[symbol];

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
    
  return (
    <>
         {coinsCardData.length > 0 && coinsCardData.map((item,key) => (
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} key={key}>
                <Card 
                sx={{
                    minWidth: 275,
                    boxShadow: '0 1px 3px 0 rgba(0,47,52,.2), 0 1px 3px 0 rgba(0,47,52,.2)',
                    borderLeft: searchCoin ? '4px solid #004bbe' : '4px solid #00C49F',
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
                            {searchCoin ? (
                                <Box>
                                    <Typography sx={{ pt:0.7 }} color="text.secondary">
                                            {item.symbol}  - {item.lastPrice}
                                    </Typography>
                                </Box>
                            ): (
                                <Box>
                                    <Typography variant="h6" component="div">
                                            {item.symbol}
                                    </Typography>
                                    <Typography sx={{ pt: 1 }} color="text.secondary">
                                            {item.lastPrice}  - {item.weightedAvgPrice}
                                    </Typography>
                                </Box>
                            )}
                            
                        </Grid>
                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                            <Grid container>
                                <Grid item xl={6} lg={6} md={6} sm={2} xs={2}>
                                    <Box sx={{ marginTop: searchCoin ? '4px' : '20px'  }}>
                                        <TextField
                                            id="outlined-number"
                                            type="number"
                                            InputLabelProps={{
                                                shrink: true
                                            }}
                                            InputProps={{
                                                inputProps: { 
                                                    max: 100, min: 1
                                                },
                                                sx:{height: '1.8em'}
                                            }}
                                            size='small'
                                            value={counts[item.symbol]}
                                            defaultValue={!(item.has_in_redux) ? 1 : item.count}
                                            onChange={(e) => handleCountChange(item.symbol, e.target.value)}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={10} xs={10}>
                                    {!(item.has_in_redux) ? (
                                        <Box sx={{ float:'right' }}>
                                            <Button 
                                                variant="contained" 
                                                type='submit'
                                                sx={{
                                                    backgroundColor: '#1C49D0',
                                                    color: '#ffffff',
                                                    textTransform: 'none',
                                                    fontWeight: 400,
                                                    fontSize: '12px',
                                                    padding: '8px 62px 8px 62px',
                                                }}
                                                size="large"
                                                onClick={() => handleAddCoin(item.symbol)}
                                                >
                                                Add
                                            </Button>
                                        </Box>
                                    ): (
                                        <Box 
                                            sx={{ 
                                                float: 'right',
                                                marginTop: searchCoin ? '0' : '12px'
                                            }}
                                        >
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
                                                        padding: '8px 15px 8px 15px',
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
                                                        padding: '8px 15px 8px 15px',
                                                        '&:hover': {backgroundColor: '#C12126'}
                                                    }}
                                                    size="small"
                                                    onClick={() => handleRemoveCoin(item.symbol)}
                                                >
                                                    remove
                                                </Button>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
                </Card>
            </Grid>
        ))}
    </>
  )
}

export default Coins