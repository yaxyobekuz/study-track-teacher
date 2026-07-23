// Redux Store
// NOTE: transitional. Only the legacy array/object caching stores remain here;
// they are being migrated to TanStack Query and this file will be removed once
// no component imports useArrayStore / useObjectStore. Modal state now lives in
// features/modal/ModalProvider (Context, no Redux).
import { configureStore } from "@reduxjs/toolkit";

// Slices
import arrayStoreReducer from "@/shared/store/arrayStore.slice";
import objectStoreReducer from "@/shared/store/objectStore.slice";

export default configureStore({
  reducer: {
    arrayStore: arrayStoreReducer,
    objectStore: objectStoreReducer,
  },
});
