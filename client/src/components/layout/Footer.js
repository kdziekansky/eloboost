import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-xl font-bold text-white">EloBoost</Link>
            <p className="mt-2">Profesjonalny serwis boostingowy CS:GO/Faceit</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-medium mb-2">Usługi</h3>
              <ul>
                <li><Link to="/calculator" className="hover:text-white">ELO Boost</Link></li>
                <li><a href="#" className="hover:text-white">Wins Boost</a></li>
                <li><a href="#" className="hover:text-white">Placement Matches</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Firma</h3>
              <ul>
                <li><a href="#" className="hover:text-white">O nas</a></li>
                <li><a href="#" className="hover:text-white">Nasi Boosterzy</a></li>
                <li><a href="#" className="hover:text-white">Kontakt</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Regulamin</h3>
              <ul>
                <li><a href="#" className="hover:text-white">Warunki korzystania</a></li>
                <li><a href="#" className="hover:text-white">Polityka prywatności</a></li>
                <li><a href="#" className="hover:text-white">Polityka zwrotów</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; {new Date().getFullYear()} EloBoost. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;