import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Profesjonalny Boosting CS:GO/Faceit
              </h1>
              <p className="text-lg mb-6 text-gray-300">
                Osiągnij swój wymarzony poziom ELO dzięki naszym profesjonalnym boosterom. Gwarantujemy szybki, bezpieczny i pewny boosting dla Twojego konta.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/calculator" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                  Rozpocznij teraz
                </Link>
                <Link to="/register" className="bg-transparent border border-indigo-600 hover:bg-indigo-600/10 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                  Utwórz konto
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Dlaczego my?</h2>
                <ul className="space-y-4">
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>100% Bezpieczeństwo i Poufność</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Profesjonalni Boosterzy (Wszyscy Poziom 10+)</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Wsparcie 24/7</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Najszybszy czas realizacji</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gwarancja zwrotu pieniędzy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nasze usługi</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Oferujemy różnorodne usługi boostingowe, aby pomóc Ci osiągnąć Twoje cele w CS:GO i Faceit.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">ELO Boosting</h3>
              <p className="text-gray-300 mb-4">
                Podniesiemy Twój rating ELO Faceit do wybranego poziomu szybko i bezpiecznie.
              </p>
              <Link to="/calculator" className="text-indigo-400 hover:text-indigo-300">
                Sprawdź ceny →
              </Link>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Wins Boosting</h3>
              <p className="text-gray-300 mb-4">
                Potrzebujesz określonej liczby zwycięstw? Nasi boosterzy zdobędą je dla Ciebie.
              </p>
              <a href="#" className="text-indigo-400 hover:text-indigo-300">
                Dowiedz się więcej →
              </a>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Placement Matches</h3>
              <p className="text-gray-300 mb-4">
                Pomożemy Ci przejść mecze kwalifikacyjne z najlepszym możliwym wynikiem.
              </p>
              <a href="#" className="text-indigo-400 hover:text-indigo-300">
                Dowiedz się więcej →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Gotowy, aby poprawić swój ranking?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych graczy i osiągnij swój wymarzony poziom ELO już dziś.
          </p>
          <Link to="/register" className="bg-white text-indigo-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition duration-300">
            Rozpocznij teraz
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;