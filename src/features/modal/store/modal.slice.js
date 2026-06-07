// Redux Store
import { createSlice } from "@reduxjs/toolkit";

// Data
import { MODAL_NAMES } from "../data/modals.data";

/**
 * Bitta modal uchun yangi boshlang'ich holat yaratadi.
 * Har modalga alohida obyekt kerak (umumiy referensdan foydalanmaymiz).
 */
const createModalState = () => ({ isOpen: false, data: {}, isLoading: false });

// Barcha ro'yxatga olingan modallar uchun boshlang'ich holat (modals.data.js)
const initialState = Object.fromEntries(
  MODAL_NAMES.map((name) => [name, createModalState()]),
);

/**
 * Modal mavjud bo'lmasa, uni o'rnida yaratadi va qaytaradi.
 * Bu ro'yxatga qo'shilmagan modal ham jim qolib ketmasligi uchun himoya.
 */
const ensureModal = (state, modal) => {
  if (!state[modal]) state[modal] = createModalState();
  return state[modal];
};

export const modalSlice = createSlice({
  initialState,
  name: "modal",
  reducers: {
    open: (state, action) => {
      const { modal, data } = action.payload;
      if (!modal) return;
      const target = ensureModal(state, modal);
      target.isOpen = true;
      Object.assign(target.data, data || {});
    },

    close: (state, action) => {
      const { modal, data } = action.payload;
      if (!modal) return;
      const target = ensureModal(state, modal);
      target.isOpen = false;
      Object.assign(target.data, data || {});
    },

    updateData: (state, action) => {
      const { modal, data } = action.payload;
      if (!modal) return;
      const target = ensureModal(state, modal);
      Object.assign(target.data, data || {});
    },

    updateLoading: (state, action) => {
      const { modal, value } = action.payload;
      if (!modal) return;
      ensureModal(state, modal).isLoading = value;
    },
  },
});

// Export actions
export const { open, close, updateLoading, updateData } = modalSlice.actions;

// Export reducer
export default modalSlice.reducer;
