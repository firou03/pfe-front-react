import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import AdminPageLayout from "components/dashboard/AdminPageLayout";
import Dashboard from "views/admin/Dashboard.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import Users from "views/admin/Users.js";
import Requests from "views/admin/Requests.js";
import Reviews from "views/admin/Reviews.js";
import Stats from "views/admin/stats.js";

function isAdminSession() {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (!token || !raw) return false;
    const user = JSON.parse(raw);
    return String(user?.role || "").toLowerCase() === "admin";
  } catch {
    return false;
  }
}

export default function Admin() {
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
    };
  }, []);

  if (!isAdminSession()) {
    return (
      <Redirect
        to={{
          pathname: "/auth/login",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <AdminPageLayout>
      <Switch>
        <Route path="/admin/dashboard" exact component={Dashboard} />
        <Route path="/admin/users" exact component={Users} />
        <Route path="/admin/requests" exact component={Requests} />
        <Route path="/admin/reviews" exact component={Reviews} />
        <Route path="/admin/stats" exact component={Stats} />
        <Route path="/admin/settings" exact component={Settings} />
        <Route path="/admin/tables" exact component={Tables} />
        <Redirect from="/admin" to="/admin/dashboard" />
      </Switch>
    </AdminPageLayout>
  );
}
