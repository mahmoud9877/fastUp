import jwt from "jsonwebtoken";

export const generateToken = ({ payload, expiresIn = "1h" }) => {
  if (!process.env.TOKEN_SIGNATURE) {
    throw new Error("TOKEN_SIGNATURE is missing from environment variables");
  }

  return jwt.sign(payload, process.env.TOKEN_SIGNATURE, { expiresIn });
};

export const verifyToken = (token) => {
  if (!process.env.TOKEN_SIGNATURE) {
    throw new Error("TOKEN_SIGNATURE is missing from environment variables");
  }

  try {
    return jwt.verify(token, process.env.TOKEN_SIGNATURE);
  } catch (error) {
    return null; // Return null instead of throwing an error
  }
};
