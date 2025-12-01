import mongoose from "../mongoose";

const { Schema, models, model } = mongoose as any;

const GameSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    pricingType: { type: String, enum: ["perGame", "per15min"], required: true },
    priceValue: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Game = models.Game || model("Game", GameSchema);

export type GameType = {
  _id: string;
  title: string;
  image?: string;
  pricingType: "perGame" | "per15min";
  priceValue: number;
};
