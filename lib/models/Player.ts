import mongoose from "../mongoose";

const { Schema, models, model } = mongoose as any;

// Delete cached model to ensure schema updates are applied
if (models.Player) {
  delete models.Player;
}

const PlayerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: false },
    phone: { type: String, required: false },
    notes: { type: String, required: false },
    loyaltyPoints: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    rewardsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Player = models.Player || model("Player", PlayerSchema);

export type PlayerType = {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  notes?: string;
  loyaltyPoints?: number;
  totalGamesPlayed?: number;
  rewardsEarned?: number;
};
