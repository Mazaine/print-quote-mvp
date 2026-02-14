export const ADMIN_DEBUG = String(import.meta.env.VITE_ADMIN_DEBUG ?? "false").toLowerCase() === "true";
export const REQUIRE_FILE_UPLOAD = String(import.meta.env.VITE_REQUIRE_FILE_UPLOAD ?? "true").toLowerCase() === "true";
