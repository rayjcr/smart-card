import Cookies from 'js-cookie';

const app = {
  state: {
    swipeState:0,
    swallowState:0,
    machineState:false,
    swipeComplete:false,
    swallowComplete:false,
    errorState:false,
    confirmExchange:false,
    checkComplete:false,
  },
  mutations: {
    Set_SwipeState:(state,view) => {
      state.swipeState = view;
    },
    Set_SwallowState:(state,view) => {
      state.swallowState = view;
    },
    Set_MachineState:(state,view) => {
      state.machineState = view;
    },
    Set_SwallowComplete:(state,view) => {
      state.swallowComplete = view;
    },
    Set_SwipeComplete:(state,view) => {
      state.swipeComplete = view;
    },
    Set_ErrorState:(state,view) => {
      state.errorState = view;
    },
    Set_ConfirmExchange:(state,view) => {
      state.confirmExchange = view;
    },
    Set_CheckComplete:(state,view) => {
      state.checkComplete = view;
    },
  },
  actions: {
    SetSwipeState: ({ commit } , view) => {
      commit('Set_SwipeState',view)
    },
    SetSwallowState: ({ commit } , view) => {
      commit('Set_SwallowState',view)
    },
    SetMachineState: ({ commit } , view) => {
      commit('Set_MachineState',view)
    },
    SetSwipeComplete: ({ commit } , view) => {
      commit('Set_SwipeComplete',view)
    },
    SetSwallowComplete: ({ commit } , view) => {
      commit('Set_SwallowComplete',view)
    },
    SetErrorState: ({ commit } , view) => {
      commit('Set_ErrorState',view)
    },
    SetConfirmExchange: ({ commit } , view) => {
      commit('Set_ConfirmExchange',view)
    },
    SetCheckComplete: ({ commit } , view) => {
      commit('Set_CheckComplete',view)
    },
  }
};

export default app;
