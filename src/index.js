import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// layouts

import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";

// views without layouts
import MesRequests from "views/MesRequests.js";
import AfficheRequest from "views/AfficheRequest.js";
import Client from "views/client.js";
import Landing from "views/Landing.js";
import Profile from "views/Profile.js";
import Index from "views/Index.js";
import ColisTracking from "views/ColisTracking.js";
import Chat from "views/Chat.js";
import ClientDashboard from "views/ClientDashboard.js";
import TransporteurDashboard from "views/TransporteurDashboard.js";


ReactDOM.render(
  <BrowserRouter>
    <Switch>
      {/* add routes with layouts */}
      <Route path="/admin" component={Admin} />
      <Route path="/auth" component={Auth} />
      {/* add routes without layouts */}
      <Route path="/mes-requests" exact component={MesRequests} />
      <Route path="/requests" exact component={AfficheRequest} />
      <Route path="/client" exact component={Client} />
      <Route path="/landing" exact component={Landing} />
      <Route path="/profile" exact component={Profile} />
      <Route path="/profile/client" exact component={Profile} />
      <Route path="/profile/transporteur" exact component={Profile} />
      <Route path="/tracking" exact component={ColisTracking} />
      <Route path="/chat" exact component={Chat} />
      <Route path="/dashboard/client" exact component={ClientDashboard} />
      <Route path="/dashboard/transporteur" exact component={TransporteurDashboard} />
      <Route path="/" exact component={Index} />
      {/* add redirect for first page */}
      <Redirect from="*" to="/" />
    </Switch>
    
  </BrowserRouter>,
  document.getElementById("root")
);
