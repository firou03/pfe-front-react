import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../service/restApiUser"; // ✅ IMPORT API

export default function Register() {


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [permisFile, setPermisFile] = useState(null);

  // handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "role" && value !== "transporteur") {
      setPermisFile(null);
    }
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "transporteur") {
      if (!permisFile) {
        alert("Veuillez joindre une copie de votre permis de conduire (PDF ou image).");
        return;
      }
    }

    try {
      if (formData.role === "transporteur" && permisFile) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("password", formData.password);
        fd.append("role", formData.role);
        fd.append("permis", permisFile);
        await registerUser(fd);
      } else {
        await registerUser(formData);
      }
      alert("Compte créé ✅");

      // redirect to login
      window.location.href = "/auth/login";

    } catch (error) {
      console.error(error);
      alert("Erreur inscription ❌");
    }
  };


  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Sign up with
                  </h6>
                </div>
                <div className="btn-wrapper text-center">
                  <button
                    className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
                    type="button"
                  >
                    <img
                      alt="..."
                      className="w-5 mr-1"
                      src={require("assets/img/github.svg").default}
                    />
                    Github
                  </button>
                  <button
                    className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
                    type="button"
                  >
                    <img
                      alt="..."
                      className="w-5 mr-1"
                      src={require("assets/img/google.svg").default}
                    />
                    Google
                  </button>
                </div>
                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Or sign up with credentials</small>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Name
                    </label>
                    <input

                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}

                    />
                  </div>
                  {/* 🔥 ROLE SELECT */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full"
                    >
                      <option value="client">Client</option>
                      <option value="transporteur">Transporteur</option>
                    </select>
                  </div>

                  {formData.role === "transporteur" && (
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="permis-file"
                      >
                        Permis de conduire
                      </label>
                      <input
                        id="permis-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => setPermisFile(e.target.files?.[0] || null)}
                        className="border-0 px-3 py-3 bg-white rounded text-sm shadow w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-lightBlue-500 file:text-white hover:file:bg-lightBlue-600"
                      />
                      {permisFile && (
                        <p className="mt-2 text-xs text-blueGray-500">
                          Fichier sélectionné : {permisFile.name}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-blueGray-400">
                        Formats acceptés : PDF, JPG, PNG (max. selon limite serveur).
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="customCheckLogin"
                        type="checkbox"
                        className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                      />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        I agree with the{" "}
                        <a
                          href="#pablo"
                          className="text-lightBlue-500"
                          onClick={(e) => e.preventDefault()}
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"

                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex flex-wrap mt-6 relative">
              <div className="w-1/2">
                <Link
                  to="/auth/forget"
                  className="text-blueGray-200"
                >
                  <small>Forgot password?</small>
                </Link>
              </div>
              <div className="w-1/2 text-right">
                <Link to="/auth/login" className="text-blueGray-200">
                  <small>Login</small>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
