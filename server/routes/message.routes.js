const supabase = require('../config/supabase');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Pobranie wiadomości dla zamówienia
// @route   GET /api/messages/:orderId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  
  // Sprawdź czy zamówienie istnieje
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (orderError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź czy użytkownik ma dostęp do zamówienia
  if (
    req.user.role !== 'admin' && 
    order.client_id !== req.user.id && 
    order.booster_id !== req.user.id
  ) {
    return next(new ErrorResponse('Brak uprawnień do tego zasobu', 403));
  }
  
  // Pobierz wiadomości
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      read,
      created_at,
      users:sender_id (id, name, avatar, role)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  
  if (error) {
    return next(new ErrorResponse('Błąd podczas pobierania wiadomości', 500));
  }
  
  // Oznacz wszystkie nieprzeczytane wiadomości jako przeczytane (te, które nie były wysłane przez bieżącego użytkownika)
  const unreadMessages = messages.filter(
    msg => !msg.read && msg.users.id !== req.user.id
  );
  
  if (unreadMessages.length > 0) {
    const unreadIds = unreadMessages.map(msg => msg.id);
    
    await supabase
      .from('messages')
      .update({ read: true })
      .in('id', unreadIds);
  }
  
  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Wysłanie nowej wiadomości
// @route   POST /api/messages/:orderId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  const { content } = req.body;
  
  // Walidacja
  if (!content) {
    return next(new ErrorResponse('Treść wiadomości jest wymagana', 400));
  }
  
  // Sprawdź czy zamówienie istnieje
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (orderError) {
    return next(new ErrorResponse('Zamówienie nie znalezione', 404));
  }
  
  // Sprawdź czy użytkownik ma dostęp do zamówienia
  if (
    req.user.role !== 'admin' && 
    order.client_id !== req.user.id && 
    order.booster_id !== req.user.id
  ) {
    return next(new ErrorResponse('Brak uprawnień do tego zasobu', 403));
  }
  
  // Zapisz wiadomość
  const { data: message, error } = await supabase
    .from('messages')
    .insert([{
      order_id: orderId,
      sender_id: req.user.id,
      content,
      read: false
    }])
    .select()
    .single();
  
  if (error) {
    return next(new ErrorResponse('Nie udało się wysłać wiadomości', 500));
  }
  
  // Pobierz dane nadawcy dla pełnej odpowiedzi
  const { data: sender } = await supabase
    .from('users')
    .select('id, name, avatar, role')
    .eq('id', req.user.id)
    .single();
  
  // Dodaj dane nadawcy do odpowiedzi
  message.users = sender;
  
  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Oznaczenie wiadomości jako przeczytane
// @route   PUT /api/messages/:messageId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;
  
  // Pobierz wiadomość
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*, orders!inner(*)')
    .eq('id', messageId)
    .single();
  
  if (fetchError) {
    return next(new ErrorResponse('Wiadomość nie znaleziona', 404));
  }
  
  // Sprawdź czy użytkownik ma dostęp do zamówienia powiązanego z wiadomością
  if (
    req.user.role !== 'admin' && 
    message.orders.client_id !== req.user.id && 
    message.orders.booster_id !== req.user.id
  ) {
    return next(new ErrorResponse('Brak uprawnień do tej wiadomości', 403));
  }
  
  // Oznacz jako przeczytane
  const { data: updatedMessage, error: updateError } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single();
  
  if (updateError) {
    return next(new ErrorResponse('Nie udało się zaktualizować wiadomości', 500));
  }
  
  res.status(200).json({
    success: true,
    data: updatedMessage
  });
});

// @desc    Pobranie liczby nieprzeczytanych wiadomości
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  // Pobierz ID zamówień, do których użytkownik ma dostęp
  let orderQuery = supabase.from('orders').select('id');
  
  if (req.user.role === 'client') {
    orderQuery = orderQuery.eq('client_id', req.user.id);
  } else if (req.user.role === 'booster') {
    orderQuery = orderQuery.eq('booster_id', req.user.id);
  }
  
  const { data: orders, error: orderError } = await orderQuery;
  
  if (orderError) {
    return next(new ErrorResponse('Błąd podczas pobierania zamówień', 500));
  }
  
  if (orders.length === 0) {
    return res.status(200).json({
      success: true,
      data: { count: 0 }
    });
  }
  
  const orderIds = orders.map(order => order.id);
  
  // Pobierz liczbę nieprzeczytanych wiadomości
  const { count, error: countError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('order_id', orderIds)
    .neq('sender_id', req.user.id)
    .eq('read', false);
  
  if (countError) {
    return next(new ErrorResponse('Błąd podczas liczenia nieprzeczytanych wiadomości', 500));
  }
  
  res.status(200).json({
    success: true,
    data: {
      count
    }
  });
});