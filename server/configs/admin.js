import User from "../models/User.js";

export const getAdminEmail = () => {
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (configuredEmail) return configuredEmail;

    // Keep a predictable admin for local development only.
    return process.env.NODE_ENV === "production" ? "" : "owner@carrental.local";
};

export const isConfiguredAdmin = (user) => {
    const adminEmail = getAdminEmail();
    return Boolean(
        adminEmail &&
        user?.role === "admin" &&
        user.email?.trim().toLowerCase() === adminEmail
    );
};

export const findConfiguredAdmin = async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) return null;
    return User.findOne({ email: adminEmail, role: "admin" });
};
