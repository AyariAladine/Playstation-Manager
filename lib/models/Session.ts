import mongoose from "../mongoose";

const { Schema, models, model } = mongoose as any;

const SessionSchema = new Schema(
  {
    playStation: { type: Schema.Types.ObjectId, ref: "PlayStation", required: true },
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Session = models.Session || model("Session", SessionSchema);

export type SessionType = {
  _id: string;
  playStation: string;
  player: string;
  game: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
};
