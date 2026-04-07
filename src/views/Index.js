/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function Index() {
  return (
    <>
      <IndexNavbar fixed />
      <section className="header relative pt-16 items-center flex h-screen max-h-860-px">
        <div className="container mx-auto items-center flex flex-wrap">
          <div className="w-full md:w-8/12 lg:w-6/12 xl:w-6/12 px-4">
            <div className="pt-32 sm:pt-0">
              <h2 className="font-semibold text-4xl text-blueGray-600">
                Bienvenue sur notre plateforme de transport
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-blueGray-500">
                Découvrez une solution simple et efficace pour gérer vos demandes de transport,
                connecter les clients avec les transporteurs et suivre vos services en temps réel.

                .
              </p>
              <div className="mt-12">
                <a
                  to="/register"
                  target="_blank"
                  className="get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-lightBlue-500 active:bg-lightBlue-600 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                >

                  S'inscrire
                </a>
                <a
                  to="/login"

                  className="github-star ml-1 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-700 active:bg-blueGray-600 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                  target="_blank"
                >
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </div>

        <img
          className="absolute top-0 b-auto right-0 pt-16 sm:w-6/12 -mt-48 sm:mt-0 w-10/12 max-h-860px"
          src={require("assets/img/pattern_react.png").default}
          alt="..."
        />
      </section>

      <section className="mt-40 pb-40 relative bg-blueGray-100">


        {/* FEATURES */}
        <div className="container mx-auto mt-20">
          <div className="flex flex-wrap text-center">

            <div className="w-full md:w-4/12 px-4">
              <div className="p-6 bg-white rounded shadow">
                <i className="fas fa-search text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2">Recherche facile</h5>
                <p className="text-blueGray-500">
                  Trouvez rapidement des offres de transport adaptées à vos besoins.
                </p>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4">
              <div className="p-6 bg-white rounded shadow">
                <i className="fas fa-robot text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2">Matching intelligent</h5>
                <p className="text-blueGray-500">
                  Notre système utilise l’IA pour proposer les meilleures correspondances.
                </p>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4">
              <div className="p-6 bg-white rounded shadow">
                <i className="fas fa-comments text-3xl text-lightBlue-500 mb-4"></i>
                <h5 className="text-xl font-bold mb-2">Communication directe</h5>
                <p className="text-blueGray-500">
                  Discutez facilement avec les transporteurs et suivez vos demandes.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="container mx-auto mt-24 flex flex-wrap items-center">
          <div className="w-full md:w-6/12 px-4">
            <img
              alt="transport"
              className="rounded-lg shadow-lg"
              src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
            />
          </div>

          <div className="w-full md:w-6/12 px-4">
            <h3 className="text-3xl font-semibold mb-4">
              Une solution moderne pour vos besoins de transport
            </h3>
            <p className="text-blueGray-500 mb-4">
              Notre plateforme facilite la mise en relation entre clients et transporteurs,
              avec des outils intelligents pour améliorer l’expérience utilisateur.
            </p>

            <ul className="list-none">
              <li className="mb-2">✔ Gestion simple des demandes</li>
              <li className="mb-2">✔ Suivi en temps réel</li>
              <li className="mb-2">✔ Plateforme sécurisée</li>
            </ul>
          </div>
        </div>

      </section>

      <section className="block relative z-1 bg-blueGray-600">
        <div className="container mx-auto">
          <div className="justify-center flex flex-wrap">
            <div className="w-full lg:w-12/12 px-4  -mt-24">
              <div className="flex flex-wrap">
                <div className="w-full lg:w-4/12 px-4">
                  <h5 className="text-xl font-semibold pb-4 text-center">
                    Login Page
                  </h5>
                  <Link to="/auth/login">
                    <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                      <img
                        alt="..."
                        className="align-middle border-none max-w-full h-auto rounded-lg"
                        src={require("assets/img/login.jpg").default}
                      />
                    </div>
                  </Link>
                </div>

                <div className="w-full lg:w-4/12 px-4">
                  <h5 className="text-xl font-semibold pb-4 text-center">
                    Profile Page
                  </h5>
                  <Link to="/profile">
                    <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                      <img
                        alt="..."
                        className="align-middle border-none max-w-full h-auto rounded-lg"
                        src={require("assets/img/profile.jpg").default}
                      />
                    </div>
                  </Link>
                </div>

                <div className="w-full lg:w-4/12 px-4">
                  <h5 className="text-xl font-semibold pb-4 text-center">
                    Landing Page
                  </h5>
                  <Link to="/landing">
                    <div className="hover:-mt-4 relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg ease-linear transition-all duration-150">
                      <img
                        alt="..."
                        className="align-middle border-none max-w-full h-auto rounded-lg"
                        src={require("assets/img/landing.jpg").default}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </>
  );
}
