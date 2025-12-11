const API_BASE_URL = "http://localhost:8000";
const DEFAULT_TIMEOUT = 10000;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function getRecords(operatorId) {
  const url = operatorId 
    ? `${API_BASE_URL}/operations/?operator_id=${operatorId}`
    : `${API_BASE_URL}/operations/`;
  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) throw new Error('Ошибка при получении записей');
  return res.json();
}

export async function getRecord(id) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/operations/${id}`);
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) throw new Error('Запись не найдена');
  return res.json();
}

export async function createRecord(record) {
  const { operator_id, ...data } = record;
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/operations/?operator_id=${operator_id}`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Ошибка при создании записи');
  }
  return res.json();
}

export async function updatePaymentStatus(id, operatorId) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/operations/${id}/pay?operator_id=${operatorId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Ошибка при оплате');
  }
  return res.json();
}

export async function cancelOperation(id, operatorId, reason) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/operations/${id}/cancel?operator_id=${operatorId}&reason=${encodeURIComponent(reason)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Ошибка при отмене');
  }
  return res.json();
}

export async function removeRecord(id) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/operations/${id}`, { method: 'DELETE' });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) throw new Error('Ошибка при удалении записи');
  return res.text();
}

// Shift endpoints
export async function openShift(operatorId) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/shifts/open?operator_id=${operatorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Ошибка при открытии смены');
  }
  return res.json();
}

export async function closeShift(shiftId, operatorId) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/shifts/close?shift_id=${shiftId}&operator_id=${operatorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Ошибка при закрытии смены');
  }
  return res.json();
}

// Services endpoints
export async function getServices() {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/services/`);
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) throw new Error('Ошибка при получении услуг');
  return res.json();
}

export async function getServiceMasters(serviceId) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/services/${serviceId}/masters`);
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) throw new Error('Ошибка при получении мастеров');
  return res.json();
}

export async function getCurrentShift(operatorId) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/shifts/current?operator_id=${operatorId}`);
  } catch (e) {
    throw new Error('Сервер недоступен или истек таймаут');
  }
  if (!res.ok) return null;
  return res.json();
}
