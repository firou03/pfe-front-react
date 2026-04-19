/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function Index() {
  return (
    <>
      <IndexNavbar fixed />

      {/* HERO */}
      <section className="header relative pt-16 flex items-center min-h-screen bg-gradient-to-b from-white to-blueGray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-8/12 lg:w-6/12 xl:w-6/12">
              <div className="pt-20 pb-12 sm:pt-8">
                <h2 className="font-extrabold text-4xl md:text-5xl leading-tight text-blueGray-800">
                  Bienvenue sur notre plateforme de transport
                </h2>

                <p className="mt-6 text-lg leading-relaxed text-blueGray-600 max-w-2xl">
                  Découvrez une solution simple et efficace pour gérer vos
                  demandes de transport, connecter les clients avec les
                  transporteurs et suivre vos services en temps réel.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/auth/register"
                    className="text-white font-bold px-7 py-3 rounded-lg bg-lightBlue-500 hover:bg-lightBlue-600 uppercase text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    S'inscrire
                  </Link>

                  <Link
                    to="/auth/login"
                    className="text-white font-bold px-7 py-3 rounded-lg bg-blueGray-700 hover:bg-blueGray-800 uppercase text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <img
          className="absolute right-0 top-16 w-10/12 sm:w-6/12 max-h-860-px opacity-95 pointer-events-none"
          src={require("assets/img/tunisiemaps.png").default}
          alt="Tunisie map"
        />
      </section>

      {/* FEATURES + INFO */}
      <section className="relative bg-blueGray-100 py-24">
        <div className="container mx-auto px-4">
          {/* Features */}
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-blueGray-800">
              Pourquoi choisir notre plateforme ?
            </h3>
            <p className="mt-3 text-blueGray-600">
              Une expérience rapide, intelligente et sécurisée.
            </p>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-4/12 px-4 mb-6 md:mb-0">
              <div className="h-full p-7 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-blueGray-100">
                <i className="fas fa-search text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2 text-blueGray-800">
                  Recherche facile
                </h5>
                <p className="text-blueGray-500 leading-relaxed">
                  Trouvez rapidement des offres de transport adaptées à vos
                  besoins.
                </p>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 mb-6 md:mb-0">
              <div className="h-full p-7 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-blueGray-100">
                <i className="fas fa-robot text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2 text-blueGray-800">
                  Matching intelligent
                </h5>
                <p className="text-blueGray-500 leading-relaxed">
                  Notre système utilise l'IA pour proposer les meilleures
                  correspondances.
                </p>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4">
              <div className="h-full p-7 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-blueGray-100">
                <i className="fas fa-comments text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2 text-blueGray-800">
                  Communication directe
                </h5>
                <p className="text-blueGray-500 leading-relaxed">
                  Discutez facilement avec les transporteurs et suivez vos
                  demandes.
                </p>
              </div>
            </div>
          </div>

          {/* Image + text */}
          <div className="mt-20 flex flex-wrap items-center -mx-4">
            <div className="w-full md:w-6/12 px-4 mb-8 md:mb-0">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  alt="transport"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
                />
              </div>
            </div>

            <div className="w-full md:w-6/12 px-4">
              <h3 className="text-3xl font-bold mb-4 text-blueGray-800">
                Une solution moderne pour vos besoins de transport
              </h3>
              <p className="text-blueGray-600 mb-6 leading-relaxed">
                Notre plateforme facilite la mise en relation entre clients et
                transporteurs, avec des outils intelligents pour améliorer
                l'expérience utilisateur.
              </p>

              <ul className="list-none space-y-3 text-blueGray-700">
                <li className="flex items-center">
                  <span className="mr-2 text-emerald-500 font-bold">✔</span>
                  Gestion simple des demandes
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-emerald-500 font-bold">✔</span>
                  Suivi en temps réel
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-emerald-500 font-bold">✔</span>
                  Plateforme sécurisée
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PAGES PREVIEW */}
      <section className="block relative z-1 bg-blueGray-700 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full lg:w-4/12 px-4 mb-8 lg:mb-0">
              <h5 className="text-xl font-semibold pb-4 text-center text-white">
                Login Page
              </h5>
              <Link to="/auth/login">
                <div className="group relative bg-white w-full shadow-lg rounded-xl overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
                  <img
                    alt="Login preview"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    src={require("assets/img/login.jpg").default}
                  />
                </div>
              </Link>
            </div>

            <div className="w-full lg:w-4/12 px-4 mb-8 lg:mb-0">
              <h5 className="text-xl font-semibold pb-4 text-center text-white">
                Profile Page
              </h5>
              <Link to="/profile">
                <div className="group relative bg-white w-full shadow-lg rounded-xl overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
                  <img
                    alt="Profile preview"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    src={require("assets/img/profile.jpg").default}
                  />
                </div>
              </Link>
            </div>

            <div className="w-full lg:w-4/12 px-4">
              <h5 className="text-xl font-semibold pb-4 text-center text-white">
                Landing Page
              </h5>
              <Link to="/landing">
                <div className="group relative bg-white w-full shadow-lg rounded-xl overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
                  <img
                    alt="Landing preview"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    src={require("assets/img/landing.jpg").default}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}