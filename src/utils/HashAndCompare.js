import bcrypt from "bcryptjs";

export const hash = ({ plaintext, salt = process.env.SALT_ROUND } = {}) => {
  if (!plaintext) throw new Error("Plaintext password is required");

  const saltRounds = parseInt(salt) || 10; // Default to 10 if salt is missing
  return bcrypt.hashSync(plaintext, saltRounds);
};

export const compare = ({ plaintext, hashValue } = {}) => {
  if (!plaintext || !hashValue) {
    console.error("Compare function received invalid arguments:", {
      plaintext,
      hashValue,
    });
    throw new Error(
      "Both plaintext and hashValue are required for password comparison"
    );
  }
  return bcrypt.compareSync(plaintext, hashValue);
};
