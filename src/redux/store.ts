import { PayloadAction, configureStore, createSlice, Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { SelectedCoinState } from './interface'

// coinSlice oluşturulması ve reducer tanımlanması
const coinSlice = createSlice({
  name: 'coinStorage',
  initialState: { coinData: [] } as SelectedCoinState, // initialState'ı dizi olarak tanımla
  reducers: {
    setCoinData: (state, action) => {
        const existingIndex = state.coinData.findIndex((item) => item.symbol === action.payload.symbol);
  
        if (existingIndex !== -1) {
          // Eğer öğe bulunursa, mevcut öğeyi güncelle
          state.coinData[existingIndex] = { ...state.coinData[existingIndex], ...action.payload };
        } else {
          // Eğer öğe bulunamazsa, yeni öğeyi ekle
          state.coinData.push(action.payload);
        }
    },
    removeCoinBySymbol: (state, action) => {
        // Belirtilen sembol ismine sahip objeyi filtreleyerek yeni bir dizi oluştur
        state.coinData = state.coinData.filter((item) => item.symbol !== action.payload);
    },
    updateCoinData: (state, action: PayloadAction<{ symbol: string; data: object }>) => {
        const { symbol, data } = action.payload;
        const existingItem = state.coinData.find((item) => item.symbol === symbol);
  
        if (existingItem) {
          // Eğer öğe bulunursa, gelen datanın tüm key-value çiftlerini kullanarak güncelle
          state.coinData[state.coinData.indexOf(existingItem)] = { ...existingItem, ...data };
        }
      },
  },
});

export const { setCoinData, removeCoinBySymbol, updateCoinData } = coinSlice.actions;

// rootReducer oluşturulması ve tüm reducer'ların birleştirilmesi
const rootReducer = {
    coinStorage: coinSlice.reducer,
};


// Özel bir middleware oluştur
const saveToLocalStorageMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    // Redux store verilerini Local Storage'a kaydetme
    localStorage.setItem('coinStorage', JSON.stringify(store.getState().coinStorage));
    return result;
};

const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      coinStorage: JSON.parse(localStorage.getItem('coinStorage') || '{"coinData": []}'),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(saveToLocalStorageMiddleware),
});
export function removeAllData(){
    localStorage.clear();
}

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
