const KEY = 'chat_visitor_id';

export function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `visitor-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
