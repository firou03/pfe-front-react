import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { resetPassword } from "../../service/restApiUser";

export default function ResetPassword() {
  const { token } = useParams();
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Validate password requirements
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    // Check for uppercase, lowercase, and number
    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une lettre majuscule");
      return;
    }
    
    if (!/[a-z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une lettre minuscule");
      return;
    }
    
    if (!/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await resetPassword(token, password);
      setMessage(response.data.message || "Mot de passe réinitialisé !");
      setTimeout(() => history.push("/auth/login"), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold mt-4">
                  <small>Réinitialiser le mot de passe</small>
                </div>
                {message && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline text-xs">{message} Redirection...</span>
                  </div>
                )}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline text-xs">{error}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3 mt-4">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative w-full mb-3 mt-4">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-center mt-6">
                    <button
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Réinitialisation..." : "Changer mon mot de passe"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
