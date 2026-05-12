import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

import AdminSidebar from "components/Sidebar/AdminSidebar.js";

import Dashboard from "views/admin/Dashboard.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import Users from "views/admin/Users.js";
import Requests from "views/admin/Requests.js";
import Reviews from "views/admin/Reviews.js";
import Stats from "views/admin/stats.js";

const ADMIN_BG = "#0f172a";

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
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOx = document.body.style.overflowX;
    document.documentElement.style.backgroundColor = ADMIN_BG;
    document.body.style.backgroundColor = ADMIN_BG;
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflowX = prevBodyOx;
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
    <div
      className="flex w-full min-h-screen box-border overflow-x-hidden"
      style={{ backgroundColor: ADMIN_BG }}
    >
      <AdminSidebar />
      <div
        className="relative flex flex-1 min-w-0 min-h-screen flex-col"
        style={{ backgroundColor: ADMIN_BG }}
      >
        <div className="w-full flex-1 px-5 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-16">
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
        </div>
      </div>
    </div>
  );
}
