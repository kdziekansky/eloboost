import React from 'react';
import BoostCalculator from '../../components/calculator/BoostCalculator';

const CalculatorPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Kalkulator boostingu CS:GO/Faceit</h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Użyj naszego kalkulatora, aby sprawdzić koszt boostingu Twojego konta. Dopasuj opcje do swoich potrzeb i uzyskaj natychmiastową wycenę.
          </p>
        </div>
        
        <BoostCalculator />
        
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-indigo-400 text-4xl mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Bezpieczeństwo</h3>
            <p className="text-gray-300">
              Wszystkie dane są szyfrowane, a nasi profesjonalni boosterzy stosują VPN dla dodatkowej ochrony. Twoje konto jest w pełni bezpieczne.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-indigo-400 text-4xl mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Szybkość</h3>
            <p className="text-gray-300">
              Nasi boosterzy pracują szybko i efektywnie. Opcja Super Express pozwala ukończyć boosting w ekspresowym tempie.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-indigo-400 text-4xl mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Wsparcie 24/7</h3>
            <p className="text-gray-300">
              Nasz zespół wsparcia jest dostępny całodobowo, aby odpowiedzieć na Twoje pytania i rozwiązać problemy.
            </p>
          </div>
        </div>
        
        <div className="mt-16 bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Często zadawane pytania</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Jak działa proces boostingu?</h3>
              <p className="text-gray-300">
                Po złożeniu zamówienia, nasz profesjonalny booster skontaktuje się z Tobą, aby ustalić szczegóły i rozpocząć boosting. Możesz śledzić postępy w czasie rzeczywistym w swoim panelu klienta.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Czy moje konto jest bezpieczne?</h3>
              <p className="text-gray-300">
                Absolutnie! Boosterzy używają VPN i przestrzegają najwyższych standardów bezpieczeństwa. Mamy politykę zerowej tolerancji dla naruszenia zasad bezpieczeństwa.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Ile czasu zajmuje boosting?</h3>
              <p className="text-gray-300">
                Czas zależy od wybranego zakresu ELO. Średnio, boosting o 300 punktów zajmuje 2-4 dni. Opcja Super Express przyspiesza ten proces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;