import { AnyAction, configureStore, createSlice } from '@reduxjs/toolkit';

interface selectedCoinState {
    coinData: any[]; // Coin verilerini tutan diziyi tanımla
}

// coinSlice oluşturulması ve reducer tanımlanması
const coinSlice = createSlice({
  name: 'coinStorage',
  initialState: { coinData: [] } as selectedCoinState, // initialState'ı dizi olarak tanımla
  reducers: {
    setCoinData: (state, action) => {
      const existingIndex = state.coinData.findIndex((item) => item.symbol === action.payload.symbol);

      if (existingIndex !== -1) {
        // Eğer öğe bulunursa, mevcut öğeyi güncelle
        state.coinData[existingIndex] = action.payload;
      } else {
        // Eğer öğe bulunamazsa, yeni öğeyi ekle
        state.coinData.push(action.payload);
      }
    },
  },
});

export const { setCoinData } = coinSlice.actions;

// rootReducer oluşturulması ve tüm reducer'ların birleştirilmesi
const rootReducer = {
    coinStorage: coinSlice.reducer,
};

// Özel bir middleware oluşturun
const saveToLocalStorageMiddleware = (store) => (next) => (action: AnyAction) => {
    const result = next(action);
    // Redux store verilerini Local Storage'a kaydetme
    localStorage.setItem('coinStorage', JSON.stringify(store.getState().coinStorage));
    return result;
};

const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
        // Local Storage'dan veriyi yükleme
        coinStorage: JSON.parse(localStorage.getItem('coinStorage') || '{"coinData": []}')
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(saveToLocalStorageMiddleware),
});

export function removeAllData(){
    localStorage.clear();
}

export default store;
