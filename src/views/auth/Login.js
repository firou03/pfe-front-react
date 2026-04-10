import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../service/restApiUser";

export default function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(formData);

      console.log(res.data);

      // save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login réussi ✅");

     
      if (res.data.user.role === "transporteur") {
        window.location.href = "/admin/cardtransporteur";
      } else {
        window.location.href = "/admin/cardclient";
      }

    } catch (error) {
      console.error(error);
      alert("Email ou mot de passe incorrect ❌");
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-4/12 px-4">

            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">

              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Sign in with
                  </h6>
                </div>
              </div>

              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">

                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Or sign in with credentials</small>
                </div>

                {/* ✅ IMPORTANT */}
                <form onSubmit={handleSubmit}>

                  {/* EMAIL */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                    />
                  </div>

                  {/* REMEMBER */}
                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="ml-1 w-5 h-5" />
                      <span className="ml-2 text-sm text-blueGray-600">
                        Remember me
                      </span>
                    </label>
                  </div>

                  {/* BUTTON */}
                  <div className="text-center mt-6">
                    <button
                      type="submit"  // ✅ IMPORTANT
                      className="bg-blueGray-800 text-white text-sm font-bold px-6 py-3 rounded shadow w-full hover:bg-blueGray-600"
                    >
                      Sign In
                    </button>
                  </div>

                </form>
              </div>
            </div>

            <div className="flex flex-wrap mt-6 relative">
              <div className="w-1/2">
                <Link to="/auth/forget" className="text-blueGray-200">
                  <small>Forgot password?</small>
                </Link>
              </div>
              <div className="w-1/2 text-right">
                <Link to="/auth/register" className="text-blueGray-200">
                  <small>Create new account</small>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}