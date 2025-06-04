/*
  # Initial Schema Setup for Tweetly-NG

  1. New Tables
    - users: Core user accounts
    - api_keys: Encrypted API keys for OpenAI and Google AI
    - bot_personas: AI bot personality configurations
    - brain_entries: Tweet ideas and content with vector embeddings
    - categories: Organization system for brain entries
    - scheduled_posts: Upcoming scheduled tweets
    - drafts: Saved tweet drafts
    - posted_tweets: Archive of published tweets

  2. Extensions
    - Enable pgvector for semantic search
    - Enable pgcrypto for API key encryption

  3. Security
    - RLS policies for all tables
    - Row-level encryption for sensitive data
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  full_name text,
  twitter_username text,
  twitter_id text UNIQUE,
  google_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Keys table (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'openai' or 'google'
  encrypted_key text NOT NULL,
  base_url text, -- For custom OpenAI endpoints
  preferred_model text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Bot Personas table
CREATE TABLE IF NOT EXISTS bot_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  personality_config jsonb NOT NULL, -- Stores the complete personality configuration
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Brain Entries table with vector support
CREATE TABLE IF NOT EXISTS brain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  content text NOT NULL,
  embedding vector(1536), -- For OpenAI ada-002 embeddings
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scheduled Posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[],
  scheduled_for timestamptz NOT NULL,
  bot_persona_id uuid REFERENCES bot_personas(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'published', 'failed'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[],
  bot_persona_id uuid REFERENCES bot_personas(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posted Tweets table
CREATE TABLE IF NOT EXISTS posted_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_id text NOT NULL,
  content text NOT NULL,
  media_urls text[],
  bot_persona_id uuid REFERENCES bot_personas(id) ON DELETE SET NULL,
  performance_metrics jsonb,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posted_tweets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

-- API Keys
CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Bot Personas
CREATE POLICY "Users can manage their own bot personas" ON bot_personas
  FOR ALL USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can manage their own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Brain Entries
CREATE POLICY "Users can manage their own brain entries" ON brain_entries
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled Posts
CREATE POLICY "Users can manage their own scheduled posts" ON scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

-- Drafts
CREATE POLICY "Users can manage their own drafts" ON drafts
  FOR ALL USING (auth.uid() = user_id);

-- Posted Tweets
CREATE POLICY "Users can view their own posted tweets" ON posted_tweets
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS brain_entries_user_id_idx ON brain_entries(user_id);
CREATE INDEX IF NOT EXISTS brain_entries_category_id_idx ON brain_entries(category_id);
CREATE INDEX IF NOT EXISTS scheduled_posts_user_id_scheduled_for_idx ON scheduled_posts(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS posted_tweets_user_id_posted_at_idx ON posted_tweets(user_id, posted_at);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS brain_entries_embedding_idx ON brain_entries 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);