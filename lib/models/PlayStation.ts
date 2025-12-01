import mongoose from "../mongoose";

const { Schema, models, model } = mongoose as any;

const PlayStationSchema = new Schema(
  {
    name: { type: String, required: true },
    model: { type: String, required: false },
    status: { type: String, enum: ["available", "occupied"], default: "available" },
    currentPlayer: { type: Schema.Types.ObjectId, ref: "Player", required: false },
    currentGame: { type: Schema.Types.ObjectId, ref: "Game", required: false },
    startTime: { type: Date, required: false },
  },
  { timestamps: true }
);

export const PlayStation = models.PlayStation || model("PlayStation", PlayStationSchema);

export type PlayStationType = {
  _id: string;
  name: string;
  model?: string;
  status: "available" | "occupied";
  currentPlayer?: string;
  currentGame?: string;
  startTime?: string | Date;
};
