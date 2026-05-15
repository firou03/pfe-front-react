import React from "react";
import { Link, Switch, Route, Redirect } from "react-router-dom";
import ThemeToggle from "components/dashboard/ThemeToggle";
import Login from "views/auth/Login.js";
import forget from "views/auth/forget";
import Register from "views/auth/Register.js";

export default function Auth() {
  return (
    <div className="auth-shell">
      <header className="auth-nav">
        <Link to="/" className="auth-nav-brand">
          TransportTN
        </Link>
        <ThemeToggle />
      </header>
      <main className="auth-main">
        <Switch>
          <Route path="/auth/login" exact component={Login} />
          <Route path="/auth/forget" exact component={forget} />
          <Route path="/auth/register" exact component={Register} />
          <Redirect from="/auth" to="/auth/login" />
        </Switch>
      </main>
    </div>
  );
}
