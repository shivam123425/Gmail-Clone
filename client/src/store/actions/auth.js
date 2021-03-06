import * as actionTypes from "./actionTypes";

export const authSuccess = data => {
  const { user, type } = data;
  return {
    type,
    payload: {
      username: user.username
    }
  };
};
export const authInit = data => {
  const { user, type } = data;
  let url;
  if (type === "Login") {
    url = "/api/auth/login";
  } else if (type === "Register") {
    url = "/api/auth/register";
  }
  return dispatch => {
    dispatch({ type: actionTypes.LOADING });
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(response => {
        if (!response.success) {
          return dispatch(authError(response.messages));
        }
        // Set received token
        localStorage.setItem("token", response.token);

        // find the user from token
        return getUser()
          .then(user => {
            if (!user) {
              dispatch(authError(["Invalid username/password"]));
            }
            return dispatch(
              authSuccess({ user, type: actionTypes.LOGIN_SUCCESS })
            );
          })
          .catch(err => {
            localStorage.removeItem("token");
            return dispatch(authError([err.message]));
          });
      })
      .catch(err => {
        return dispatch(authError([err.message]));
      });
  };
};
export const getUser = () => {
  return fetch("/api/auth/current", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  }).then(res => res.json());
};

export const checkLogin = () => {
  return dispatch => {
    dispatch({ type: actionTypes.LOADING });
    const token = localStorage.getItem("token");
    if (!token) {
      return dispatch({ type: actionTypes.LOGOUT });
    }
    return getUser()
      .then(user => {
        if (!user) {
          dispatch(authError(["Invalid username/password"]));
        }
        return dispatch(authSuccess({ user, type: actionTypes.LOGIN_SUCCESS }));
      })
      .catch(err => {
        localStorage.removeItem("token");
        return dispatch(authError([err.message]));
      });
  };
};
export const authError = errorMessageArr => {
  return {
    type: actionTypes.AUTH_ERROR,
    payload: {
      errorMessageArr
    }
  };
};
