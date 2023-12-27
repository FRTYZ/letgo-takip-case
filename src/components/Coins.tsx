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

import { setCoinData, removeCoinBySymbol, updateCoinData, useAppSelector, useAppDispatch } from '../redux/store';


interface CoinsAreaProps {
    data: object[],
    searchCoin: boolean,
    targetRef: React.RefObject<HTMLDivElement>;
}

// Card component tip tanımlaması
type coinsCardType = {
    symbol?: string,
    lastPrice?: number,
    weightedAvgPrice?: number,
    has_in_redux?: boolean,
    count?:number
}

const Coins: React.FC<CoinsAreaProps> = ({ data, searchCoin, targetRef }) => {
    const dispatch = useAppDispatch();
    const {coinData} = useAppSelector((state) => state?.coinStorage);

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
            const limitedData = data.slice(startIndex, endIndex);

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

    },[data])

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
                data: {
                    count: number,
                    has_in_redux: boolean
                }
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
            data: {
                count: number
            }
        } = {
            symbol: symbol,
            data: {
                count: Number(value),
            }
        };

        dispatch(updateCoinData(updateData));
    }


     //--------- Material UI area --------------
    const card = {
        minWidth: 275,
        boxShadow: '0 1px 3px 0 rgba(0,47,52,.2), 0 1px 3px 0 rgba(0,47,52,.2)',
        borderLeft: searchCoin ? '4px solid #004bbe' : '4px solid #00C49F',
        marginBottom: '20px',
        paddingBottom: 0
    }

    const cardContent = { 
        padding: {
            lg: '15px 20px 15px 20px !important', 
            xl: '15px 20px 15px 20px !important', 
            md: '15px 20px 15px 20px !important', 
            xs: '20px 20px 20px 20px !important' 
        }
    }

    const cardTypographyBoxForSearch = { 
        paddingTop:'7.4px',
        paddingBottom: {
            lg: 0, 
            xl: 0, 
            md: 0, 
            xs: 6 
        },
        paddingLeft:'7px',
        display: 'flex'
    }

    const cardCoinSymbolForSearch = {
        fontSize: '15px',
        paddingRight: '4px'
    }

    const cardCoinValuesForSearch = {
        fontSize: '13px',
        paddingTop: '1.4px',
        color: '#00000099'
    }

    const cardTypographyBoxForPortfoy = {
        paddingLeft:'6px',
        paddingTop: '2px'
    }
    
    const cardCoinSymbolForPortfoy = {
        fontSize: '15px'
    }

    const cardCoinValuesForPortfoy = {
         pt: 0,
         fontSize: '12px',
         color: '#00000099'
    }

    const cardBoxCount = {
        marginTop: searchCoin ? '4px' : '9px'
    }

    const cardAddButton = {
        backgroundColor: 'palette.text.primary',
        color: '#ffffff',
        textTransform: 'none',
        fontWeight: 400,
        fontSize: '12px',
        padding: '8px 62px 8px 62px',
        marginRight: '5px',
    }
    
    const cardBoxButton = { 
        display:'flex',
        float: 'right',
        marginTop: searchCoin ? '0' : '4px'
    }

    const cardUpdateAndRemoveButton = {
        color: '#ffffff',
        marginRight: '5px',
        textTransform: 'none',
        fontWeight: 400,
        fontSize: '12px',
        padding: '8px 15px 8px 15px'
    }

    
    
  return (
    <>
         {coinsCardData.length > 0 && coinsCardData.map((item: coinsCardType, key: number) => (
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} key={key}>
                <Card sx={card}>
                    <CardContent sx={cardContent}>
                        <Grid container spacing={1}>
                            <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                 {/* Coin bilgi alanı */}
                                {searchCoin ? (
                                    <Box sx={cardTypographyBoxForSearch}>
                                        <Typography sx={cardCoinSymbolForSearch}>{item.symbol}</Typography> 
                                        <Typography sx={cardCoinValuesForSearch}>
                                              - {item.lastPrice}
                                        </Typography>
                                    </Box>
                                ): (
                                    <Box sx={cardTypographyBoxForPortfoy}>
                                        <Typography sx={cardCoinSymbolForPortfoy}>
                                                {item.symbol}
                                        </Typography>
                                        <Typography sx={cardCoinValuesForPortfoy}>
                                                {item.lastPrice}  - {item.weightedAvgPrice}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                            <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                <Grid container>
                                    {/* Coin adet belirleme alanı */}
                                    <Grid item xl={6} lg={6} md={6} sm={2} xs={2}>
                                        <Box sx={cardBoxCount}>
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
                                                    sx:{ height: '1.8em'}
                                                }}
                                                size='small'
                                                value={counts[item.symbol]}
                                                defaultValue={!(item.has_in_redux) ? 1 : item.count}
                                                onChange={(e) => handleCountChange(item.symbol, e.target.value)}
                                            />
                                        </Box>
                                    </Grid>
                                     {/* Sağ taraf button alanı */}
                                    <Grid item xl={6} lg={6} md={6} sm={10} xs={10}>
                                        {!(item.has_in_redux) ? (
                                            <Box sx={cardBoxButton}>
                                                <Button 
                                                    variant="contained" 
                                                    type='submit'
                                                    sx={cardAddButton}
                                                    size="large"
                                                    onClick={() => handleAddCoin(item.symbol)}
                                                >
                                                    Add
                                                </Button>
                                            </Box>
                                        ): (
                                            <Box sx={cardBoxButton}>
                                                <Button 
                                                    variant="contained" 
                                                    type='submit'
                                                    sx={cardUpdateAndRemoveButton}
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleUpdateCoin(item.symbol)}
                                                >
                                                    update
                                                </Button>
                                                <Button 
                                                    variant="contained" 
                                                    type='submit'
                                                    sx={cardUpdateAndRemoveButton}
                                                    size="small"
                                                    color="error"
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