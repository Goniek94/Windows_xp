import User from "../../../models/user/user.js";
import bcrypt from "bcryptjs";
import logger from "../../../utils/logger.js";
import { generatePasswordResetToken } from "../../../utils/securityTokens.js";

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      logger.warn("Password reset requested for non-existent email", {
        email: email.toLowerCase().trim(),
        ip: req.ip,
      });
      return res.status(200).json({
        success: true,
        message:
          "Jeśli podany adres email istnieje w systemie, wysłaliśmy link do resetowania hasła.",
      });
    }

    const resetToken = generatePasswordResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Jeśli podany adres email istnieje w systemie, wysłaliśmy link do resetowania hasła.",
    });
  } catch (error) {
    logger.error("Password reset request error", { error: error.message, ip: req.ip });
    res.status(500).json({ success: false, message: "Błąd serwera podczas żądania resetu hasła" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link do resetowania hasła jest nieprawidłowy lub wygasł",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Hasło zostało pomyślnie zresetowane" });
  } catch (error) {
    logger.error("Password reset error", { error: error.message, ip: req.ip });
    res.status(500).json({ success: false, message: "Błąd serwera podczas resetowania hasła" });
  }
};
