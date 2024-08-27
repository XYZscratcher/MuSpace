import React from "react";
import ReactDOM from "react-dom/client";
import { Route, Switch, Link } from "wouter";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Switch>
      <Route path="/lyrics"><p>111</p></Route>
      <Route><App /></Route>
    </Switch>
  </React.StrictMode>,
);
