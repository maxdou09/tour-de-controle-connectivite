// Cette app a été conçue à l'origine pour l'environnement Claude.ai, qui fournit
// un stockage persistant via `window.storage`. En local, il n'existe pas —
// on reproduit donc la même interface (get/set/delete/list) en s'appuyant
// simplement sur le localStorage du navigateur. Le reste du code (App.jsx)
// n'a besoin d'aucune modification.

const PERSONAL_PREFIX = "tdc:personal:";
const SHARED_PREFIX = "tdc:shared:";

function keyFor(key, shared) {
  return (shared ? SHARED_PREFIX : PERSONAL_PREFIX) + key;
}

function makeStorage() {
  return {
    async get(key, shared = false) {
      try {
        const raw = localStorage.getItem(keyFor(key, shared));
        if (raw === null) return null;
        return { key, value: raw, shared };
      } catch (e) {
        console.error("storage.get error", e);
        return null;
      }
    },

    async set(key, value, shared = false) {
      try {
        localStorage.setItem(keyFor(key, shared), value);
        return { key, value, shared };
      } catch (e) {
        console.error("storage.set error", e);
        return null;
      }
    },

    async delete(key, shared = false) {
      try {
        const k = keyFor(key, shared);
        const existed = localStorage.getItem(k) !== null;
        localStorage.removeItem(k);
        return { key, deleted: existed, shared };
      } catch (e) {
        console.error("storage.delete error", e);
        return null;
      }
    },

    async list(prefix = "", shared = false) {
      try {
        const base = shared ? SHARED_PREFIX : PERSONAL_PREFIX;
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(base)) {
            const short = k.slice(base.length);
            if (short.startsWith(prefix)) keys.push(short);
          }
        }
        return { keys, prefix, shared };
      } catch (e) {
        console.error("storage.list error", e);
        return null;
      }
    },
  };
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = makeStorage();
}
