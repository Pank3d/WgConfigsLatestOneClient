import { Markup } from "telegraf";
import { safeReply } from "../helpers/helpers.js";

export async function startCommand(ctx) {
  try {
    await safeReply(
      ctx,
      "Нажмите сделать конфиг",
      Markup.keyboard([["Сделать конфиг"]]).oneTime().resize()
    );
  } catch (error) {
    console.error("Ошибка в startCommand:", error);
  }
}
