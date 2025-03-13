const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('BŁĄD! Brakuje zmiennych środowiskowych SUPABASE_URL lub SUPABASE_ANON_KEY!');
  process.exit(1); // Zakończ proces, jeśli brakuje kluczowych zmiennych
}

console.log('Inicjalizacja Supabase z URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Test połączenia przy uruchomieniu
(async () => {
  try {
    // Prosty test połączenia - poprawione zapytanie
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Test połączenia z Supabase nie powiódł się:', error);
    } else {
      console.log('✅ Połączenie z Supabase nawiązane poprawnie!');
    }
  } catch (err) {
    console.error('❌ Krytyczny błąd podczas testowania połączenia z Supabase:', err);
  }
})();

module.exports = supabase;