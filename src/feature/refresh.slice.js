import { createSlice } from "@reduxjs/toolkit";

export const refreshSlice = createSlice({
    name: 'refresh',
    initialState: {
        historique_candidatures: 0,
        historique_projects: 0,
        historique_contrats: 0
    },
    reducers: {
        refreshHistoriqueCandidatures: (state) => {
            ++state.historique_candidatures;
        },
        refreshHistoriqueProjects: (state) => {
            ++state.historique_projects;
        },
        refreshHistoriqueContrats: (state) => {
            ++state.historique_contrats;
        }
    }
})

export default refreshSlice.reducer;
export const { refreshHistoriqueCandidatures, refreshHistoriqueProjects, refreshHistoriqueContrats } = refreshSlice.actions