const initAuth = {
  user: {},
  details: {},
};

export default (state = initAuth, action) => {
  switch (action.type) {
    case 'SET_USER': {
      return {...state, ...action.payload};
    }
    default: {
      return state;
    }
  }
};
