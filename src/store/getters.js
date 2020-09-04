

const getters = {
  errorState: state => state.app.errorState,
  swipeState: state => state.app.swipeState,
  swallowState: state => state.app.swallowState,
  machineState: state => state.app.machineState,
  swipeComplete: state => state.app.swipeComplete,
  swallowComplete: state => state.app.swallowComplete,
  confirmExchange: state => state.app.confirmExchange,
  checkComplete: state => state.app.checkComplete,
};
export default getters
