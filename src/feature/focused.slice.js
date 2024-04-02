import { createSlice } from "@reduxjs/toolkit";

export const focusedSlice = createSlice({
    name: 'focused',
    initialState: false,
    reducers: {
        setFocused: (state, action) => {
            state = action.payload
        }
    }
})

export default focusedSlice.reducer;
export const { setFocused } = focusedSlice.actions