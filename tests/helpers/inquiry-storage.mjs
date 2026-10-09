export function inquiryStorage(entries = []) {
  const values = new Map(entries);
  let pending = Promise.resolve();
  return {
    values,
    transaction(callback) {
      const result = pending.then(async () => {
        const draft = new Map(values);
        const value = await callback({
          get: async key => draft.get(key),
          put: async (key, entry) => { draft.set(key, entry); },
        });
        values.clear();
        for (const [key, entry] of draft) values.set(key, entry);
        return value;
      });
      pending = result.then(() => undefined, () => undefined);
      return result;
    },
  };
}
