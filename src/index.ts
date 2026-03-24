import { Schema as MongooseSchema, Types, type HydratedDocument } from 'mongoose';

/**
 * Options for the voting plugin.
 */
export interface VotingOptions {
  /** Name of the referenced model for voter arrays. Defaults to `'User'`. */
  ref?: string;
}

/**
 * Schema paths added by the voting plugin.
 */
export interface VotingPaths {
  vote: {
    positive: Types.Array<Types.ObjectId>;
    negative: Types.Array<Types.ObjectId>;
  };
}

/**
 * Accepted voter input: a model instance with `_id`, an ObjectId, or a hex string.
 */
export type VoterInput = Types.ObjectId | string | { _id: Types.ObjectId | string };

/**
 * Instance methods added by the voting plugin.
 */
export interface VotingMethods {
  upvote(user: VoterInput): void;
  downvote(user: VoterInput): void;
  unvote(user: VoterInput): void;
  upvoted(user: VoterInput): boolean;
  downvoted(user: VoterInput): boolean;
  voted(user: VoterInput): boolean;
  upvotes(): number;
  downvotes(): number;
  votes(): number;
}

/**
 * Convenience type for documents that include voting paths and methods.
 */
export type VotingDocument<T = unknown> = HydratedDocument<T> & VotingPaths & VotingMethods;

/**
 * Mongoose voting plugin.
 *
 * Adds `vote.positive` / `vote.negative` arrays and nine instance methods
 * to the target schema.
 *
 * @param schema - The Mongoose schema to extend.
 * @param options - Plugin options.
 */
export default function voting(schema: MongooseSchema, options: VotingOptions = {}): void {
  const ref = options.ref ?? 'User';

  schema.add({
    vote: {
      positive: { type: [{ type: MongooseSchema.Types.ObjectId, ref }], default: [] },
      negative: { type: [{ type: MongooseSchema.Types.ObjectId, ref }], default: [] },
    },
  });

  schema.methods.upvote = function (user: VoterInput): void {
    this.vote.negative.pull(user);
    this.vote.positive.addToSet(user);
  };

  schema.methods.downvote = function (user: VoterInput): void {
    this.vote.positive.pull(user);
    this.vote.negative.addToSet(user);
  };

  schema.methods.unvote = function (user: VoterInput): void {
    this.vote.positive.pull(user);
    this.vote.negative.pull(user);
  };

  schema.methods.upvoted = function (user: VoterInput): boolean {
    const id = (user as any)._id ?? user;
    return this.vote.positive.some((v: Types.ObjectId) => v.equals(id));
  };

  schema.methods.downvoted = function (user: VoterInput): boolean {
    const id = (user as any)._id ?? user;
    return this.vote.negative.some((v: Types.ObjectId) => v.equals(id));
  };

  schema.methods.voted = function (user: VoterInput): boolean {
    return this.upvoted(user) || this.downvoted(user);
  };

  schema.methods.upvotes = function (): number {
    return this.vote.positive.length;
  };

  schema.methods.downvotes = function (): number {
    return this.vote.negative.length;
  };

  schema.methods.votes = function (): number {
    return this.vote.positive.length + this.vote.negative.length;
  };
}
