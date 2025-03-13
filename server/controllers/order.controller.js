const supabase = require('../config/supabase');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Pobranie wszystkich zamówień dla klienta lub boostera
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query = supabase.from('orders');
  
  // Filtrowanie zamówień w zależności od roli użytkownika
  if (req.user.role === 'client') {
    query = query.eq('client_id', req.user.id);
  } else if (req.user.role === 'booster') {
    query = query.eq('booster_id', req.user.id);
  } else if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Brak uprawnień do tego zasobu', 403));
  }
  
  // Filtry i sortowanie
  const status = req.query.status;
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  
  // Domyślne sortowanie od najnowszych
  query = query.order('created_at', { ascending: false });
  
  // Paginacja
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to);
  
  // Wykonanie zapytania
  const { data: orders, error, count } = await query.select('*').limit(limit);
  
  if (error) {
    return next(new ErrorResponse('Błąd podczas pobierania zamówień', 500));
  }
  
  // Pobierz całkowitą liczbę zamówień dla paginacji
  const { count: totalOrders, error: countError } = await supabase
    .from('orders')
    .count()
    .eq(req.user.role === 'client' ? 'client_id' : 'booster_id', req.user.id);
  
  if (countError) {
    return next(new ErrorResponse('Błąd podczas liczenia zamówień', 500));
  }
  
  res.status(200).json({
    success: true,
    count: orders.length,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Pobranie pojedynczego zamówienia
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (error) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź czy użytkownik ma dostęp do tego zamówienia
  if (
    req.user.role !== 'admin' && 
    order.client_id !== req.user.id && 
    order.booster_id !== req.user.id
  ) {
    return next(new ErrorResponse('Brak uprawnień do tego zasobu', 403));
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Utworzenie nowego zamówienia
// @route   POST /api/orders
// @access  Private (tylko klienci)
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Sprawdź czy użytkownik jest klientem
  if (req.user.role !== 'client') {
    return next(new ErrorResponse('Tylko klienci mogą tworzyć zamówienia', 403));
  }
  
  // Dodaj ID klienta do danych zamówienia
  req.body.client_id = req.user.id;
  req.body.status = 'pending';
  
  // Sprawdź wymagane pola
  const requiredFields = ['order_type', 'price_amount'];
  
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorResponse(`Proszę podać ${field}`, 400));
    }
  }
  
  // Dodatkowa walidacja w zależności od typu zamówienia
  if (req.body.order_type === 'eloBoosting') {
    if (!req.body.current_rating || !req.body.desired_rating) {
      return next(new ErrorResponse('Dla boostu ELO wymagane są current_rating i desired_rating', 400));
    }
  } else if (req.body.order_type === 'winsBoost') {
    if (!req.body.wins_required) {
      return next(new ErrorResponse('Dla boostu wygranych wymagane jest wins_required', 400));
    }
  } else if (req.body.order_type === 'placementMatches') {
    if (!req.body.placement_matches) {
      return next(new ErrorResponse('Dla meczy kwalifikacyjnych wymagane jest placement_matches', 400));
    }
  }

  // Zapisz zamówienie w bazie danych
  const { data: order, error } = await supabase
    .from('orders')
    .insert([req.body])
    .select()
    .single();
  
  if (error) {
    return next(new ErrorResponse('Nie udało się utworzyć zamówienia', 500));
  }
  
  // Dodaj wpis w timeline zamówienia
  await supabase
    .from('order_timeline')
    .insert([{
      order_id: order.id,
      status: 'pending',
      note: 'Zamówienie zostało utworzone'
    }]);
  
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Aktualizacja zamówienia
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  // Pobierz aktualne zamówienie
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (fetchError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź uprawnienia
  if (req.user.role === 'client' && order.client_id !== req.user.id) {
    return next(new ErrorResponse('Brak uprawnień do aktualizacji tego zamówienia', 403));
  }
  
  if (req.user.role === 'booster' && order.booster_id !== req.user.id) {
    return next(new ErrorResponse('Brak uprawnień do aktualizacji tego zamówienia', 403));
  }
  
  // Ogranicz pola, które można aktualizować w zależności od roli
  let updateData = {};
  
  if (req.user.role === 'client') {
    // Klient może anulować zamówienie lub zaktualizować dane konta
    const allowedFields = ['account_login', 'account_password', 'steam_offline_mode'];
    
    if (req.body.status === 'cancelled' && order.status === 'pending') {
      updateData.status = 'cancelled';
    }
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
  } else if (req.user.role === 'booster') {
    // Booster może aktualizować postęp i status
    const allowedFields = [
      'current_progress_rating', 
      'current_progress_wins',
      'current_progress_matches'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    // Walidacja zmiany statusu
    if (req.body.status) {
      // Booster może zmienić status tylko w określony sposób
      if (
        (order.status === 'pending' && req.body.status === 'inProgress') ||
        (order.status === 'inProgress' && req.body.status === 'completed')
      ) {
        updateData.status = req.body.status;
      } else {
        return next(new ErrorResponse('Nieprawidłowa zmiana statusu', 400));
      }
    }
  } else if (req.user.role === 'admin') {
    // Admin może aktualizować wszystkie pola
    updateData = req.body;
  }
  
  // Dodaj datę aktualizacji
  updateData.last_updated = new Date().toISOString();
  
  // Aktualizuj zamówienie
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (updateError) {
    return next(new ErrorResponse('Nie udało się zaktualizować zamówienia', 500));
  }
  
  // Jeśli zmieniono status, dodaj wpis w timeline
  if (updateData.status && updateData.status !== order.status) {
    await supabase
      .from('order_timeline')
      .insert([{
        order_id: order.id,
        status: updateData.status,
        note: req.body.note || `Status zamówienia zmieniony na ${updateData.status}`
      }]);
  }
  
  res.status(200).json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Przyjęcie zamówienia przez boostera
// @route   POST /api/orders/:id/accept
// @access  Private (tylko boosterzy)
exports.acceptOrder = asyncHandler(async (req, res, next) => {
  // Sprawdź czy użytkownik jest boosterem
  if (req.user.role !== 'booster') {
    return next(new ErrorResponse('Tylko boosterzy mogą przyjmować zamówienia', 403));
  }
  
  // Pobierz aktualne zamówienie
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (fetchError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź czy zamówienie jest dostępne do przyjęcia
  if (order.status !== 'pending' || order.booster_id) {
    return next(new ErrorResponse('To zamówienie nie jest dostępne do przyjęcia', 400));
  }
  
  // Aktualizuj zamówienie - przypisz boostera
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      booster_id: req.user.id,
      status: 'inProgress',
      last_updated: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (updateError) {
    return next(new ErrorResponse('Nie udało się przyjąć zamówienia', 500));
  }
  
  // Dodaj wpis w timeline
  await supabase
    .from('order_timeline')
    .insert([{
      order_id: order.id,
      status: 'inProgress',
      note: 'Zamówienie zostało przyjęte przez boostera'
    }]);
  
  res.status(200).json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Dodanie recenzji i oceny dla boostera
// @route   POST /api/orders/:id/feedback
// @access  Private (tylko klienci)
exports.addFeedback = asyncHandler(async (req, res, next) => {
  // Sprawdź czy użytkownik jest klientem
  if (req.user.role !== 'client') {
    return next(new ErrorResponse('Tylko klienci mogą dodawać oceny', 403));
  }
  
  // Sprawdź wymagane pola
  if (!req.body.rating) {
    return next(new ErrorResponse('Proszę podać ocenę', 400));
  }
  
  // Sprawdź czy ocena jest między 1 a 5
  if (req.body.rating < 1 || req.body.rating > 5) {
    return next(new ErrorResponse('Ocena musi być między 1 a 5', 400));
  }
  
  // Pobierz aktualne zamówienie
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (fetchError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź czy użytkownik jest właścicielem zamówienia
  if (order.client_id !== req.user.id) {
    return next(new ErrorResponse('Brak uprawnień do dodania oceny', 403));
  }
  
  // Sprawdź czy zamówienie jest zakończone
  if (order.status !== 'completed') {
    return next(new ErrorResponse('Można oceniać tylko zakończone zamówienia', 400));
  }
  
  // Aktualizuj zamówienie - dodaj ocenę
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      feedback_rating: req.body.rating,
      feedback_comment: req.body.comment || null,
      feedback_given_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (updateError) {
    return next(new ErrorResponse('Nie udało się dodać oceny', 500));
  }
  
  // Aktualizuj rating boostera
  // Pobierz wszystkie oceny boostera
  const { data: boosterOrders, error: boosterOrdersError } = await supabase
    .from('orders')
    .select('feedback_rating')
    .eq('booster_id', order.booster_id)
    .not('feedback_rating', 'is', null);
  
  if (!boosterOrdersError && boosterOrders.length > 0) {
    // Oblicz średnią ocenę
    const totalRating = boosterOrders.reduce((sum, order) => sum + order.feedback_rating, 0);
    const averageRating = totalRating / boosterOrders.length;
    
    // Aktualizuj profil boostera
    await supabase
      .from('users')
      .update({
        booster_rating: averageRating,
        booster_completed_orders: boosterOrders.length
      })
      .eq('id', order.booster_id);
  }
  
  res.status(200).json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Pobranie dostępnych zamówień dla boosterów
// @route   GET /api/orders/available
// @access  Private (tylko boosterzy)
exports.getAvailableOrders = asyncHandler(async (req, res, next) => {
  // Sprawdź czy użytkownik jest boosterem
  if (req.user.role !== 'booster') {
    return next(new ErrorResponse('Tylko boosterzy mają dostęp do dostępnych zamówień', 403));
  }
  
  // Filtry
  const orderType = req.query.orderType || 'all';
  const minElo = parseInt(req.query.minElo) || 0;
  const maxElo = parseInt(req.query.maxElo) || 100000;
  
  // Buduj zapytanie
  let query = supabase
    .from('orders')
    .select('*')
    .is('booster_id', null)
    .eq('status', 'pending');
  
  // Filtrowanie po typie zamówienia
  if (orderType !== 'all') {
    query = query.eq('order_type', orderType);
  }
  
  // Filtrowanie po ELO dla eloBoosting
  if (orderType === 'all' || orderType === 'eloBoosting') {
    query = query.gte('current_rating', minElo);
    
    if (maxElo < 100000) {
      query = query.lte('desired_rating', maxElo);
    }
  }
  
  // Sortowanie od najnowszych
  query = query.order('created_at', { ascending: false });
  
  // Paginacja
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to);
  
  // Wykonanie zapytania
  const { data: orders, error, count } = await query;
  
  if (error) {
    return next(new ErrorResponse('Błąd podczas pobierania dostępnych zamówień', 500));
  }
  
  // Pobierz całkowitą liczbę dostępnych zamówień dla paginacji
  const { count: totalOrders, error: countError } = await supabase
    .from('orders')
    .count()
    .is('booster_id', null)
    .eq('status', 'pending');
  
  if (countError) {
    return next(new ErrorResponse('Błąd podczas liczenia dostępnych zamówień', 500));
  }
  
  res.status(200).json({
    success: true,
    count: orders.length,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Pobranie historii zamówienia (timeline)
// @route   GET /api/orders/:id/timeline
// @access  Private
exports.getOrderTimeline = asyncHandler(async (req, res, next) => {
  // Pobierz zamówienie
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (orderError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź uprawnienia
  if (
    req.user.role !== 'admin' && 
    order.client_id !== req.user.id && 
    order.booster_id !== req.user.id
  ) {
    return next(new ErrorResponse('Brak uprawnień do tego zasobu', 403));
  }
  
  // Pobierz timeline
  const { data: timeline, error: timelineError } = await supabase
    .from('order_timeline')
    .select('*')
    .eq('order_id', req.params.id)
    .order('created_at', { ascending: true });
  
  if (timelineError) {
    return next(new ErrorResponse('Błąd podczas pobierania historii zamówienia', 500));
  }
  
  res.status(200).json({
    success: true,
    data: timeline
  });
});