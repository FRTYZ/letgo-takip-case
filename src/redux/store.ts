import { AnyAction, configureStore, createSlice } from '@reduxjs/toolkit';

interface selectedCoinState {
    coinData?: any;
}

// coinSlice oluşturulması ve reducer tanımlanması
const coinSlice = createSlice({
  name: 'coinStorage',
  initialState: {} as selectedCoinState,
  reducers: {
    setCoinData: (state, action) => {
      state.coinData = { ...state.coinData, ...action.payload}
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
        coinStorage: JSON.parse(localStorage.getItem('coinStorage') || '{}')
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(saveToLocalStorageMiddleware),
});

export function removeAllData(){
    localStorage.clear();
}

export default store;
