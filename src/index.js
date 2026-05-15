import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";
import "assets/styles/dashboard.css";

// layouts

import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";

// views without layouts
import MesRequests from "views/MesRequests.js";
import Historique from "views/Historique.js";
import AfficheRequest from "views/AfficheRequest.js";
import Client from "views/client.js";
import MesDemandesClient from "views/client/MesDemandesClient.js";

import Profile from "views/Profile.js";
import Index from "views/Index.js";
import ColisTracking from "views/ColisTracking.js";
import Chat from "views/Chat.js";
import ClientDashboard from "views/ClientDashboard.js";
import ClientPayments from "views/ClientPayments.js";
import TransporteurDashboard from "views/TransporteurDashboard.js";
import ResetPassword from "views/auth/ResetPassword.js";
import { ThemeProvider } from "context/ThemeContext";

ReactDOM.render(
  <ThemeProvider>
  <BrowserRouter>
    <Switch>
      {/* add routes with layouts */}
      <Route path="/admin" component={Admin} />
      <Route path="/auth/reset-password/:token" component={ResetPassword} />
      <Route path="/auth" component={Auth} />
      {/* add routes without layouts */}
      <Route path="/mes-requests" exact component={MesRequests} />
      <Route path="/historique" exact component={Historique} />
      <Route path="/client-requests" exact component={MesDemandesClient} />
      <Route path="/requests" exact component={AfficheRequest} />
      <Route path="/client" exact component={Client} />
      <Route path="/client-payments" exact component={ClientPayments} />

      <Route path="/profile" exact component={Profile} />
      <Route path="/profile/client" exact component={Profile} />
      <Route path="/profile/transporteur" exact component={Profile} />
      <Route path="/profile/:userId" exact component={Profile} />
      <Route path="/tracking" exact component={ColisTracking} />
      <Route path="/chat" exact component={Chat} />
      <Route path="/dashboard/client" exact component={ClientDashboard} />
      <Route path="/dashboard/transporteur" exact component={TransporteurDashboard} />
      <Route path="/" exact component={Index} />
      {/* add redirect for first page */}
      <Redirect from="*" to="/" />
    </Switch>

  </BrowserRouter>
  </ThemeProvider>,
  document.getElementById("root")
);
