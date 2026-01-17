import type { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export interface VotingOptions {
  /**
   * Name of the referenced model to store inside the voting arrays.
   * Defaults to `User`.
   */
  ref?: string;
}

export interface VotingPaths {
  vote: {
    positive: Types.Array<Types.ObjectId>;
    negative: Types.Array<Types.ObjectId>;
  };
}

export type VotingCallback<TDoc = unknown> = (error: unknown, document: TDoc) => void;

export interface VotingMethods {
  upvote(user: VoterInput, callback?: VotingCallback): this;
  downvote(user: VoterInput, callback?: VotingCallback): this;
  unvote(user: VoterInput, callback?: VotingCallback): this;
  upvoted(user: VoterInput): boolean;
  downvoted(user: VoterInput): boolean;
  voted(user: VoterInput): boolean;
  upvotes(): number;
  downvotes(): number;
  votes(): number;
}

export type VoterInput = Types.ObjectId | string | { _id: Types.ObjectId | string };

const resolveVoterId = (input: VoterInput): Types.ObjectId | string => {
  if (typeof input === 'string' || input instanceof Types.ObjectId) {
    return input;
  }

  return input._id instanceof Types.ObjectId ? input._id : String(input._id);
};

const matchesVoter = (
  stored: Types.ObjectId,
  voterId: Types.ObjectId | string,
): boolean => {
  if (typeof voterId === 'string') {
    return stored.equals(voterId) || stored.toString() === voterId;
  }

  return stored.equals(voterId);
};

/**
 * Mongoose voting plugin that extends a schema with standard voting helpers.
 */
const votingPlugin = <TSchema extends Schema = Schema>(
  schema: TSchema,
  options: VotingOptions = {},
): void => {
  const voterModelName = options.ref ?? 'User';

  schema.add({
    vote: {
      positive: {
        type: [
          {
            type: MongooseSchema.Types.ObjectId,
            ref: voterModelName,
          },
        ],
        default: [],
      },
      negative: {
        type: [
          {
            type: MongooseSchema.Types.ObjectId,
            ref: voterModelName,
          },
        ],
        default: [],
      },
    },
  });

  type SchemaShape = InferSchemaType<TSchema>;
  type VoteDocument = HydratedDocument<SchemaShape> & VotingPaths & VotingMethods;

  const ensureVoteInitialized = (doc: VoteDocument): void => {
    if (!doc.vote) {
      doc.set('vote', { positive: [], negative: [] });
    }
  };

  const applySaveIfRequested = (
    doc: VoteDocument,
    callback?: VotingCallback<VoteDocument>,
  ): void => {
    if (callback) {
      void doc
        .save()
        .then((saved: HydratedDocument<SchemaShape>) => {
          callback(null, saved as VoteDocument);
        })
        .catch((error: unknown) => {
          callback(error, doc);
        });
    }
  };

  schema.methods.upvote = function upvote(
    this: VoteDocument,
    user: VoterInput,
    callback?: VotingCallback<VoteDocument>,
  ) {
    ensureVoteInitialized(this);

    const voterId = resolveVoterId(user);

    this.vote.negative.pull(voterId);
    this.vote.positive.addToSet(voterId);

    applySaveIfRequested(this, callback);

    return this;
  };

  schema.methods.downvote = function downvote(
    this: VoteDocument,
    user: VoterInput,
    callback?: VotingCallback<VoteDocument>,
  ) {
    ensureVoteInitialized(this);

    const voterId = resolveVoterId(user);

    this.vote.positive.pull(voterId);
    this.vote.negative.addToSet(voterId);

    applySaveIfRequested(this, callback);

    return this;
  };

  schema.methods.unvote = function unvote(
    this: VoteDocument,
    user: VoterInput,
    callback?: VotingCallback<VoteDocument>,
  ) {
    ensureVoteInitialized(this);

    const voterId = resolveVoterId(user);

    this.vote.negative.pull(voterId);
    this.vote.positive.pull(voterId);

    applySaveIfRequested(this, callback);

    return this;
  };

  schema.methods.upvoted = function upvoted(this: VoteDocument, user: VoterInput): boolean {
    ensureVoteInitialized(this);

    const voterId = resolveVoterId(user);

    return this.vote.positive.some((stored: Types.ObjectId) => matchesVoter(stored, voterId));
  };

  schema.methods.downvoted = function downvoted(this: VoteDocument, user: VoterInput): boolean {
    ensureVoteInitialized(this);

    const voterId = resolveVoterId(user);

    return this.vote.negative.some((stored: Types.ObjectId) => matchesVoter(stored, voterId));
  };

  schema.methods.voted = function voted(this: VoteDocument, user: VoterInput): boolean {
    ensureVoteInitialized(this);

    return this.upvoted(user) || this.downvoted(user);
  };

  schema.methods.upvotes = function upvotes(this: VoteDocument): number {
    ensureVoteInitialized(this);
    return this.vote.positive.length;
  };

  schema.methods.downvotes = function downvotes(this: VoteDocument): number {
    ensureVoteInitialized(this);
    return this.vote.negative.length;
  };

  schema.methods.votes = function votes(this: VoteDocument): number {
    ensureVoteInitialized(this);
    return this.vote.positive.length + this.vote.negative.length;
  };
};

export default votingPlugin;
